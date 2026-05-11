import { clearAuthToken, getAuthToken, getRestaurant } from "./auth";
import type {
  ApiDashboardResponse,
  ApiTrendingItem,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatSession,
  DashboardData,
  DishRanking,
  MustHaveItem,
  NoveltyItem,
  PerformerItem,
  TrendingItem,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const OVERRIDE_CAFE_ID = process.env.NEXT_PUBLIC_DEMO_CAFE_ID;

function currentCafeId(): number | string {
  if (OVERRIDE_CAFE_ID) return OVERRIDE_CAFE_ID;
  const restaurant = getRestaurant();
  return restaurant?.id ?? "30";
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
      // Force JSON error bodies — without this Rails serves HTML 500 pages
      // (empty body in production) and we lose the real failure reason.
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    const reason = await safeReadError(res);
    clearAuthToken();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    throw new ApiError(401, reason ?? "Session expired — please sign in again.");
  }
  if (!res.ok) {
    const reason = await safeReadError(res);
    throw new ApiError(
      res.status,
      reason ?? `API ${path} failed: ${res.status} ${res.statusText}`
    );
  }
  return (await res.json()) as T;
}

async function safeReadError(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error ?? data.message ?? null;
  } catch {
    return null;
  }
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
    trending: flattenTrending(raw.trending).map(normalizeTrending),
    mustHaves: asArray<ApiDashboardResponse["must_haves"][number]>(raw.must_haves).map(normalizeMustHave),
    bestPerformers: asArray<ApiDashboardResponse["best_performers"][number]>(raw.best_performers).map(normalizePerformer),
    worstPerformers: asArray<ApiDashboardResponse["worst_performers"][number]>(raw.worst_performers).map(normalizePerformer),
    novelty: asArray<ApiDashboardResponse["novelty"][number]>(raw.novelty).map(normalizeNovelty),
    dishRankings: asArray<ApiDashboardResponse["dish_rankings"][number]>(raw.dish_rankings).map(normalizeDishRanking),
  };
}

// Backend may send trending as either a flat array or { rising, falling }.
// Combine the two groups (rising first) so downstream code can keep treating
// it as one list — the `direction` field on each item still distinguishes them.
function flattenTrending(value: unknown): ApiTrendingItem[] {
  if (Array.isArray(value)) return value as ApiTrendingItem[];
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const rising = Array.isArray(obj.rising) ? (obj.rising as ApiTrendingItem[]) : [];
    const falling = Array.isArray(obj.falling) ? (obj.falling as ApiTrendingItem[]) : [];
    return [...rising, ...falling];
  }
  return [];
}

// Guards against the backend handing back null, an object, or a wrapped
// shape like { items: [...] } where we expected a plain array. Returning a
// safe empty array keeps the dashboard rendering instead of crashing.
function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const k of ["items", "data", "results"]) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

function normalizeTrending(t: ApiTrendingItem): TrendingItem {
  return {
    canonicalDishId: t.canonical_dish_id,
    name: t.display_name,
    cuisineType: t.cuisine_type,
    category: t.category,
    // Backend ships growth as an unsigned decimal magnitude (0.002 = 0.2%).
    // Convert to percent and apply the direction sign so falling dishes
    // surface as negative numbers everywhere they're rendered.
    growthRate: t.growth_rate * 100 * (t.direction === "falling" ? -1 : 1),
    direction: t.direction,
    servedByCafe: t.served_by_cafe,
    trendLevel: t.trend_level,
    trendLabel: t.trend_label,
    priority: t.priority,
    directionLabel: t.direction_label,
    ownerMessage: t.owner_message,
    recommendedAction: t.recommended_action,
    groups: t.groups ?? [],
    trendScore: scoreFromTrendLevel(t.trend_level),
  };
}

function normalizeMustHave(m: ApiDashboardResponse["must_haves"][number]): MustHaveItem {
  return {
    canonicalDishId: m.canonical_dish_id,
    name: m.display_name,
    avgRating: m.avg_rating,
    totalReviews: m.total_reviews,
    competitorCount: m.competitor_count,
    opportunityLabel: m.opportunity_label,
    mustHaveScore: scoreFromOpportunity(m.opportunity_label),
  };
}

function normalizePerformer(p: ApiDashboardResponse["best_performers"][number]): PerformerItem {
  return {
    menuItemId: p.menu_item_id,
    name: p.name,
    performanceLabel: p.performance_label,
    rating: parseFloat(p.rating),
    reviewCount: p.review_count,
    performanceScore: scoreFromPerformanceLabel(p.performance_label),
  };
}

function normalizeNovelty(n: ApiDashboardResponse["novelty"][number]): NoveltyItem {
  const missing = n.missing_ingredients ?? [];
  // Without explicit overlap data, infer pantry coverage: zero missing = 100%,
  // each missing ingredient costs 15 points. Floors at 30%.
  const overlap = Math.max(0.3, 1 - missing.length * 0.15);
  return {
    name: n.global_dish_name,
    readinessLabel: n.readiness_label,
    missingIngredients: missing,
    noveltyScore: scoreFromReadiness(n.readiness_label),
    overlapRatio: overlap,
  };
}

// ── Label → synthetic 0–1 score helpers ──────────────────────────────────────
// The new backend returns qualitative labels instead of numeric scores. These
// map labels to scores (kept in the 0..1 range that the rest of the codebase
// already expects — UI multiplies by 100 for display) so existing visuals
// (progress bars, big numbers, sort order) keep working.

function scoreFromTrendLevel(level: ApiTrendingItem["trend_level"]): number {
  switch (level) {
    case "exploding":
      return 0.95;
    case "strong_trend":
      return 0.8;
    case "trending":
      return 0.6;
    case "stable_interest":
      return 0.45;
    default:
      return 0.5;
  }
}

function scoreFromOpportunity(
  label: ApiDashboardResponse["must_haves"][number]["opportunity_label"]
): number {
  switch (label) {
    case "High Demand Gap":
      return 0.95;
    case "Strong Opportunity":
      return 0.8;
    case "Worth Considering":
      return 0.65;
    default:
      return 0.6;
  }
}

function scoreFromPerformanceLabel(
  label: ApiDashboardResponse["best_performers"][number]["performance_label"]
): number {
  switch (label) {
    case "Top Performer":
      return 0.9;
    case "Reliable Item":
      return 0.65;
    case "Needs Attention":
      return 0.25;
    default:
      return 0.5;
  }
}

function scoreFromReadiness(
  label: ApiDashboardResponse["novelty"][number]["readiness_label"]
): number {
  return label === "Ready to Add" ? 0.9 : 0.7;
}

function normalizeDishRanking(d: ApiDashboardResponse["dish_rankings"][number]): DishRanking {
  const ratingRaw = typeof d.rating === "string" ? parseFloat(d.rating) : null;
  return {
    menuItemId: d.menu_item_id,
    name: d.name,
    canonicalDishId: d.canonical_dish_id,
    displayName: d.display_name,
    price: parseFloat(d.price),
    avgGroupPrice: d.avg_group_price,
    priceDelta: d.price_delta,
    rating: ratingRaw != null && Number.isFinite(ratingRaw) ? ratingRaw : null,
    reviewCount: typeof d.review_count === "number" ? d.review_count : 0,
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

// Fetches the list of chat sessions for the cafe. Backend shape is unknown,
// so accept several common conventions and normalize into ChatSession.
export async function fetchChatSessions(
  cafeId: number | string = currentCafeId()
): Promise<ChatSession[]> {
  const raw = await apiFetch<unknown>(`/api/v1/cafes/${cafeId}/chat_sessions`);
  const list = extractSessionList(raw);
  return list.map(normalizeSessionSummary);
}

// Fetches a single session — full messages history. We hydrate a complete
// ChatSession (summary + messages) so the UI can drop it straight in.
export async function fetchChatSession(
  sessionId: string | number,
  cafeId: number | string = currentCafeId()
): Promise<ChatSession> {
  const raw = await apiFetch<unknown>(
    `/api/v1/cafes/${cafeId}/chat_sessions/${sessionId}`
  );
  return normalizeSessionDetail(raw, sessionId);
}

function extractSessionList(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];
  const obj = input as Record<string, unknown>;
  const keys = ["sessions", "chat_sessions", "data", "results", "items"];
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function normalizeSessionSummary(raw: unknown): ChatSession {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      title: "Conversation",
      lastMessage: "",
      timestamp: "",
      updatedAt: "",
      messages: [],
    };
  }
  const obj = raw as Record<string, unknown>;
  const id = String(obj.id ?? obj.session_id ?? "");
  const title =
    pickString(obj, ["title", "name", "summary"]) ??
    fallbackTitleFromObject(obj) ??
    "Conversation";
  const lastMessage =
    pickString(obj, ["last_message", "preview", "snippet", "lastMessage"]) ?? "";
  const updatedAt =
    pickString(obj, ["updated_at", "created_at", "timestamp", "inserted_at"]) ?? "";
  const timestamp = formatTimestamp(obj);
  return { id, title, lastMessage, timestamp, updatedAt, messages: [] };
}

function normalizeSessionDetail(raw: unknown, fallbackId: string | number): ChatSession {
  // Backends may wrap the session in { session: {...} } or return it flat.
  const root =
    raw && typeof raw === "object" && (raw as Record<string, unknown>).session
      ? ((raw as Record<string, unknown>).session as unknown)
      : raw;
  const summary = normalizeSessionSummary(root);
  if (!summary.id) summary.id = String(fallbackId);

  const messages = extractMessageList(root).map(normalizeMessage).filter(Boolean) as ChatMessage[];
  summary.messages = messages;
  if (!summary.lastMessage) {
    const last = [...messages].reverse().find((m) => m.role === "assistant") ?? messages[messages.length - 1];
    summary.lastMessage = last?.content ?? "";
  }
  if (summary.title === "Conversation" && messages.length > 0) {
    const firstUser = messages.find((m) => m.role === "user");
    if (firstUser) summary.title = firstUser.content.slice(0, 60);
  }
  return summary;
}

function extractMessageList(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];
  const obj = input as Record<string, unknown>;
  const keys = ["messages", "chat_messages", "history", "data"];
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function normalizeMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const content =
    pickString(obj, ["content", "body", "text", "message"]) ?? "";
  if (!content) return null;
  const rawRole = typeof obj.role === "string" ? obj.role.toLowerCase() : "";
  const senderType = typeof obj.sender_type === "string" ? obj.sender_type.toLowerCase() : "";
  const isAssistant =
    rawRole === "assistant" ||
    rawRole === "ai" ||
    rawRole === "bot" ||
    senderType === "assistant" ||
    senderType === "ai" ||
    senderType === "bot" ||
    obj.from_user === false;
  return { role: isAssistant ? "assistant" : "user", content };
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

function fallbackTitleFromObject(obj: Record<string, unknown>): string | null {
  // Use the first user message snippet if it was eagerly returned.
  const messages = obj.messages;
  if (Array.isArray(messages)) {
    for (const m of messages) {
      if (!m || typeof m !== "object") continue;
      const mo = m as Record<string, unknown>;
      const role = typeof mo.role === "string" ? mo.role.toLowerCase() : "";
      const content = pickString(mo, ["content", "body", "text", "message"]);
      if (role === "user" && content) return content.slice(0, 60);
    }
  }
  return null;
}

function formatTimestamp(obj: Record<string, unknown>): string {
  const iso =
    pickString(obj, ["updated_at", "created_at", "timestamp", "inserted_at"]) ?? "";
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
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
