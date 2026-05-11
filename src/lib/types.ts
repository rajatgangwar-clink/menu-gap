// ─────────────────────────────────────────────────────────────────────────────
// API shapes (snake_case) — match the Ruby backend response exactly
// ─────────────────────────────────────────────────────────────────────────────

export type TrendDirection = "rising" | "falling" | "stable";
export type DirectionLabel = "Rising Quickly" | "Holding Steady" | "Cooling Down";
export type TrendLevel =
  | "exploding"
  | "strong_trend"
  | "trending"
  | "stable_interest";
export type Priority = "high" | "medium" | "low";
export type TrendGroup = "rising_fast" | "high_demand_staples" | "other";
export type OpportunityLabel =
  | "High Demand Gap"
  | "Strong Opportunity"
  | "Worth Considering"
  | string;
export type PerformanceLabel =
  | "Top Performer"
  | "Reliable Item"
  | "Needs Attention"
  | string;
export type ReadinessLabel = "Ready to Add" | string;
export type PriceLabel = "underpriced" | "fair" | "overpriced";
export type PerformanceStatus = "Excellent" | "Good" | "Average" | "Poor";

export interface ApiTrendingItem {
  canonical_dish_id: number;
  display_name: string;
  cuisine_type: string | null;
  category: string | null;
  growth_rate: number;
  direction: TrendDirection;
  served_by_cafe: boolean;
  trend_level: TrendLevel;
  trend_label: string;
  priority: Priority;
  direction_label: DirectionLabel;
  owner_message: string;
  recommended_action: string;
  groups?: TrendGroup[];
}

export interface ApiMustHaveItem {
  canonical_dish_id: number;
  display_name: string;
  avg_rating: number;
  total_reviews: number;
  competitor_count: number;
  opportunity_label: OpportunityLabel;
}

export interface ApiPerformerItem {
  menu_item_id: number;
  name: string;
  performance_label: PerformanceLabel;
  rating: string;
  review_count: number;
}

export interface ApiNoveltyItem {
  global_dish_name: string;
  readiness_label: ReadinessLabel;
  missing_ingredients: string[];
}

export interface ApiDishRanking {
  menu_item_id: number;
  name: string;
  canonical_dish_id: number;
  display_name: string;
  price: string;
  avg_group_price: number;
  price_delta: number;
  label: PriceLabel;
  rank: number;
  group_size: number;
}

// Backend now groups trending into rising/falling. Older deployments may
// still send a flat array, so accept both shapes.
export type ApiTrendingPayload =
  | ApiTrendingItem[]
  | { rising?: ApiTrendingItem[]; falling?: ApiTrendingItem[] };

export interface ApiDashboardResponse {
  cafe_id: number;
  trending: ApiTrendingPayload;
  must_haves: ApiMustHaveItem[];
  best_performers: ApiPerformerItem[];
  worst_performers: ApiPerformerItem[];
  novelty: ApiNoveltyItem[];
  dish_rankings: ApiDishRanking[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Frontend domain shapes (camelCase) — what components consume
// ─────────────────────────────────────────────────────────────────────────────

export interface TrendingItem {
  canonicalDishId: number;
  name: string;
  cuisineType: string | null;
  category: string | null;
  growthRate: number;
  direction: TrendDirection;
  servedByCafe: boolean;
  trendLevel: TrendLevel;
  trendLabel: string;
  priority: Priority;
  directionLabel: DirectionLabel;
  ownerMessage: string;
  recommendedAction: string;
  groups: TrendGroup[];
  /** Derived 0–100 score so legacy UI elements (progress bars, sort) keep working. */
  trendScore: number;
}

export interface MustHaveItem {
  canonicalDishId: number;
  name: string;
  avgRating: number;
  totalReviews: number;
  competitorCount: number;
  opportunityLabel: OpportunityLabel;
  /** Derived 0–100 score from `opportunity_label`. */
  mustHaveScore: number;
}

export interface PerformerItem {
  menuItemId: number;
  name: string;
  performanceLabel: PerformanceLabel;
  rating: number;
  reviewCount: number;
  /** Derived 0–100 score from `performance_label`. */
  performanceScore: number;
}

export interface NoveltyItem {
  name: string;
  readinessLabel: ReadinessLabel;
  missingIngredients: string[];
  /** Derived 0–100 score so existing visuals work. */
  noveltyScore: number;
  /** Derived 0–1 pantry match from missing-ingredient count. */
  overlapRatio: number;
}

export interface DishRanking {
  menuItemId: number;
  name: string;
  canonicalDishId: number;
  displayName: string;
  price: number;
  avgGroupPrice: number;
  priceDelta: number;
  label: PriceLabel;
  rank: number;
  groupSize: number;
}

export interface DashboardData {
  cafeId: number;
  trending: TrendingItem[];
  mustHaves: MustHaveItem[];
  bestPerformers: PerformerItem[];
  worstPerformers: PerformerItem[];
  novelty: NoveltyItem[];
  dishRankings: DishRanking[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat (separate endpoint)
// ─────────────────────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  /** Human-friendly relative label (e.g. "5m ago"). */
  timestamp: string;
  /** Raw ISO timestamp from the backend — used for filter/sort. May be empty. */
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  cafeId?: number | string;
}

export interface ChatResponse {
  content: string;
}
