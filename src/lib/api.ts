import { clearAuthToken, getAuthToken } from "./auth";
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
const DEMO_CAFE_ID = process.env.NEXT_PUBLIC_DEMO_CAFE_ID ?? "1";

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
    throw new ApiError(401, "Authentication failed — token rejected. Try again.");
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
  cafeId: number | string = DEMO_CAFE_ID
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
  cafeId: number | string = DEMO_CAFE_ID
): Promise<string> {
  const data = await apiFetch<CreateSessionResponse>(
    `/api/v1/cafes/${cafeId}/chat_sessions`,
    { method: "POST", body: JSON.stringify({}) }
  );
  const id = data.session_id ?? data.id;
  if (id == null) throw new ApiError(0, "chat_sessions response missing session id");
  return String(id);
}

interface SendChatRawResponse {
  // Different conventions the backend might use — try in order.
  reply?: string;
  message?: string | { content?: string; body?: string };
  content?: string;
  assistant_message?: string | { content?: string };
  data?: { content?: string; message?: string };
  [key: string]: unknown;
}

export async function sendChatMessage(req: ChatRequest & { sessionId: string }): Promise<ChatResponse> {
  const cafeId = req.cafeId ?? DEMO_CAFE_ID;
  const data = await apiFetch<SendChatRawResponse>(`/api/v1/cafes/${cafeId}/chat`, {
    method: "POST",
    body: JSON.stringify({
      session_id: Number(req.sessionId),
      message: req.message,
    }),
  });

  const content = extractAssistantText(data);
  if (!content) {
    throw new ApiError(0, "Chat response did not include a readable message");
  }
  return { content };
}

function extractAssistantText(data: SendChatRawResponse): string | null {
  if (typeof data.reply === "string") return data.reply;
  if (typeof data.content === "string") return data.content;
  if (typeof data.message === "string") return data.message;
  if (typeof data.message === "object" && data.message) {
    if (typeof data.message.content === "string") return data.message.content;
    if (typeof data.message.body === "string") return data.message.body;
  }
  if (typeof data.assistant_message === "string") return data.assistant_message;
  if (typeof data.assistant_message === "object" && data.assistant_message) {
    if (typeof data.assistant_message.content === "string") return data.assistant_message.content;
  }
  if (data.data && typeof data.data === "object") {
    if (typeof data.data.content === "string") return data.data.content;
    if (typeof data.data.message === "string") return data.data.message;
  }
  return null;
}
