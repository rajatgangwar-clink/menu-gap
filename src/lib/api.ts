import { clearAuthToken, getAuthToken, getRestaurant } from "./auth";
import type {
  ApiDashboardResponse,
  ChatRequest,
  ChatResponse,
  DashboardData,
  DishRanking,
  MustHaveItem,
  NoveltyItem,
  PerformerItem,
  TrendingItem,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
// Hard override — when set, every cafe-scoped API call targets this ID
// regardless of the restaurant returned by /login.
const OVERRIDE_CAFE_ID = process.env.NEXT_PUBLIC_DEMO_CAFE_ID;

function currentCafeId(): number | string {
  if (OVERRIDE_CAFE_ID) return OVERRIDE_CAFE_ID;
  const restaurant = getRestaurant();
  return restaurant?.id ?? "1";
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, "NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    clearAuthToken();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    throw new ApiError(401, "Session expired — please sign in again.");
  }
  if (!res.ok) {
    throw new ApiError(res.status, `API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard / Intelligence
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchDashboard(
  cafeId: number | string = currentCafeId()
): Promise<DashboardData> {
  const raw = await apiFetch<ApiDashboardResponse>(`/api/v1/cafes/${cafeId}/intelligence`);
  return normalizeDashboard(raw);
}

function normalizeDashboard(raw: ApiDashboardResponse): DashboardData {
  return {
    cafeId: raw.cafe_id,
    trending: (raw.trending ?? []).map(normalizeTrending),
    mustHaves: (raw.must_haves ?? []).map(normalizeMustHave),
    bestPerformers: (raw.best_performers ?? []).map(normalizePerformer),
    worstPerformers: (raw.worst_performers ?? []).map(normalizePerformer),
    novelty: (raw.novelty ?? []).map(normalizeNovelty),
    dishRankings: (raw.dish_rankings ?? []).map(normalizeDishRanking),
  };
}

function normalizeTrending(t: ApiDashboardResponse["trending"][number]): TrendingItem {
  return {
    canonicalDishId: t.canonical_dish_id,
    name: t.display_name,
    trendScore: t.trend_score,
    direction: t.direction,
    servedByCafe: t.served_by_cafe,
  };
}

function normalizeMustHave(m: ApiDashboardResponse["must_haves"][number]): MustHaveItem {
  return {
    canonicalDishId: m.canonical_dish_id,
    name: m.display_name,
    avgRating: m.avg_rating,
    totalReviews: m.total_reviews,
    competitorCount: m.competitor_count,
    mustHaveScore: m.must_have_score,
  };
}

function normalizePerformer(p: ApiDashboardResponse["best_performers"][number]): PerformerItem {
  return {
    menuItemId: p.menu_item_id,
    name: p.name,
    performanceScore: p.performance_score,
    rating: parseFloat(p.rating),
    reviewCount: p.review_count,
    trendScore: p.trend_score,
  };
}

function normalizeNovelty(n: ApiDashboardResponse["novelty"][number]): NoveltyItem {
  return {
    name: n.global_dish_name,
    noveltyScore: n.novelty_score,
    overlapRatio: n.overlap_ratio,
    missingIngredients: n.missing_ingredients,
  };
}

function normalizeDishRanking(d: ApiDashboardResponse["dish_rankings"][number]): DishRanking {
  return {
    menuItemId: d.menu_item_id,
    name: d.name,
    canonicalDishId: d.canonical_dish_id,
    displayName: d.display_name,
    price: parseFloat(d.price),
    avgGroupPrice: d.avg_group_price,
    priceDelta: d.price_delta,
    label: d.label,
    rank: d.rank,
    groupSize: d.group_size,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────────────────────────────────────

interface CreateSessionResponse {
  id?: number | string;
  session_id?: number | string;
  // Allow other fields the backend might return.
  [key: string]: unknown;
}

export async function createChatSession(
  cafeId: number | string = currentCafeId()
): Promise<string> {
  const data = await apiFetch<CreateSessionResponse>(
    `/api/v1/cafes/${cafeId}/chat_sessions`,
    { method: "POST", body: JSON.stringify({}) }
  );
  const id = data.session_id ?? data.id;
  if (id == null) throw new ApiError(0, "chat_sessions response missing session id");
  return String(id);
}

export async function sendChatMessage(
  req: ChatRequest & { sessionId: string }
): Promise<ChatResponse> {
  const cafeId = req.cafeId ?? currentCafeId();
  const data = await apiFetch<unknown>(`/api/v1/cafes/${cafeId}/chat`, {
    method: "POST",
    body: JSON.stringify({
      session_id: Number(req.sessionId),
      message: req.message,
    }),
  });

  if (process.env.NODE_ENV !== "production") {
    console.debug("[chat] raw response", data);
  }

  const content = extractAssistantText(data);
  if (!content) {
    throw new ApiError(
      0,
      `Chat response did not include a readable message. Got: ${truncate(
        JSON.stringify(data),
        180
      )}`
    );
  }
  return { content };
}

// Pulls the assistant's reply out of whatever shape the backend hands back.
// Tries a wide set of conventions including OpenAI-style chat completions and
// generic message-array payloads.
function extractAssistantText(input: unknown): string | null {
  if (input == null) return null;

  // Plain string body — return as-is.
  if (typeof input === "string") return input;

  if (typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;

  // Top-level string fields commonly used by chat APIs.
  const directKeys = [
    "reply",
    "response",
    "answer",
    "text",
    "output",
    "content",
    "message",
    "ai_message",
    "assistant_message",
    "result",
  ];
  for (const k of directKeys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v;
  }

  // Common nested shapes: { message: { content/body/text }, ... }
  const nestedHosts = [
    "message",
    "ai_message",
    "assistant_message",
    "data",
    "result",
    "session",
  ];
  for (const k of nestedHosts) {
    const candidate = obj[k];
    const got = pickStringField(candidate, ["content", "body", "text", "message", "reply"]);
    if (got) return got;
  }

  // OpenAI-style: { choices: [{ message: { content }, text? }] }
  if (Array.isArray(obj.choices)) {
    for (const c of obj.choices) {
      if (!c || typeof c !== "object") continue;
      const cobj = c as Record<string, unknown>;
      const fromMsg = pickStringField(cobj.message, ["content", "text"]);
      if (fromMsg) return fromMsg;
      if (typeof cobj.text === "string" && cobj.text.trim()) return cobj.text;
    }
  }

  // Messages-array shape — pick the latest assistant message.
  const messages =
    pickArrayField(obj, ["messages"]) ??
    pickArrayField(obj.session, ["messages"]) ??
    pickArrayField(obj.data, ["messages"]);
  if (messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!m || typeof m !== "object") continue;
      const mobj = m as Record<string, unknown>;
      const role = mobj.role;
      if (role !== undefined && role !== "assistant") continue;
      const got = pickStringField(mobj, ["content", "body", "text", "message"]);
      if (got) return got;
    }
  }

  return null;
}

function pickStringField(host: unknown, keys: string[]): string | null {
  if (!host || typeof host !== "object") return null;
  const o = host as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

function pickArrayField(host: unknown, keys: string[]): unknown[] | null {
  if (!host || typeof host !== "object") return null;
  const o = host as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }
  return null;
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
