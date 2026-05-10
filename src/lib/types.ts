// ─────────────────────────────────────────────────────────────────────────────
// API shapes (snake_case) — match the Ruby backend response exactly
// ─────────────────────────────────────────────────────────────────────────────

export type TrendDirection = "rising" | "falling" | "stable";
export type PriceLabel = "underpriced" | "fair" | "overpriced";
export type PerformanceStatus = "Excellent" | "Good" | "Average" | "Poor";

export interface ApiTrendingItem {
  canonical_dish_id: number;
  display_name: string;
  trend_score: number;
  direction: TrendDirection;
  served_by_cafe: boolean;
}

export interface ApiMustHaveItem {
  canonical_dish_id: number;
  display_name: string;
  avg_rating: number;
  total_reviews: number;
  competitor_count: number;
  must_have_score: number;
}

export interface ApiPerformerItem {
  menu_item_id: number;
  name: string;
  performance_score: number;
  rating: string;
  review_count: number;
  trend_score: number;
}

export interface ApiNoveltyItem {
  global_dish_name: string;
  novelty_score: number;
  overlap_ratio: number;
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

export interface ApiDashboardResponse {
  cafe_id: number;
  trending: ApiTrendingItem[];
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
  trendScore: number;
  direction: TrendDirection;
  servedByCafe: boolean;
}

export interface MustHaveItem {
  canonicalDishId: number;
  name: string;
  avgRating: number;
  totalReviews: number;
  competitorCount: number;
  mustHaveScore: number;
}

export interface PerformerItem {
  menuItemId: number;
  name: string;
  performanceScore: number;
  rating: number;
  reviewCount: number;
  trendScore: number;
}

export interface NoveltyItem {
  name: string;
  noveltyScore: number;
  overlapRatio: number;
  missingIngredients: string[];
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
  timestamp: string;
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
