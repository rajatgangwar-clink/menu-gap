// Prompt templates fed into the AI Assistance chat. Keep one builder per
// "card type" so each surface has a self-contained, reviewable prompt.

import type {
  MustHaveItem,
  NoveltyItem,
  PerformerItem,
  TrendingItem,
} from "./types";

export function mustHaveAnalysisPrompt(item: MustHaveItem): string {
  const competitorWord = item.competitorCount === 1 ? "competitor" : "competitors";
  const reviewWord = item.totalReviews === 1 ? "review" : "reviews";
  return [
    `Should I add ${item.name} to my menu?`,
    "",
    "Context from my data:",
    `• ${item.competitorCount} ${competitorWord} in my area serve it`,
    `• Average rating ${item.avgRating.toFixed(1)}/5 across ${item.totalReviews.toLocaleString()} ${reviewWord}`,
    `• Must-have score: ${Math.round(item.mustHaveScore * 100)}/100`,
    "",
    "Give me a clear recommendation with reasoning, and call out any risks or quick wins.",
  ].join("\n");
}

export function topPerformerAnalysisPrompt(item: PerformerItem): string {
  const reviewWord = item.reviewCount === 1 ? "review" : "reviews";
  return [
    `How can I get more out of ${item.name}, one of my top-performing dishes?`,
    "",
    "Context from my data:",
    `• Performance score: ${Math.round(item.performanceScore * 100)}/100`,
    `• Rating ${item.rating.toFixed(1)}/5 across ${item.reviewCount.toLocaleString()} ${reviewWord}`,
    "",
    "Suggest ways to amplify it — promotion ideas, combos, pricing tweaks, or upsell opportunities.",
  ].join("\n");
}

export function worstPerformerAnalysisPrompt(item: PerformerItem): string {
  return [
    `What should I do about ${item.name}, one of my worst-performing dishes?`,
    "",
    "Context from my data:",
    `• Performance score: ${Math.round(item.performanceScore * 100)}/100`,
    `• Rating ${item.rating.toFixed(1)}/5 across ${item.reviewCount.toLocaleString()} ${item.reviewCount === 1 ? "review" : "reviews"}`,
    "",
    "Should I fix it (and how) or remove it from the menu? Be direct.",
  ].join("\n");
}

export function trendingPlanPrompt(item: TrendingItem): string {
  const onMenu = item.servedByCafe ? "I already serve it" : "I don't serve it yet";
  return [
    `Help me plan ${item.servedByCafe ? "how to capitalize on" : "whether to add"} ${item.name}.`,
    "",
    "Context from my data:",
    `• ${onMenu}`,
    `• Trend level: ${item.trendLabel}`,
    `• Direction: ${item.directionLabel}`,
    `• Growth rate: ${item.growthRate >= 0 ? "+" : ""}${item.growthRate.toFixed(2)}%`,
    item.cuisineType ? `• Cuisine: ${item.cuisineType}` : null,
    item.category ? `• Category: ${item.category}` : null,
    item.ownerMessage ? `• Note: ${item.ownerMessage}` : null,
    item.recommendedAction ? `• Recommended action: ${item.recommendedAction}` : null,
    "",
    item.servedByCafe
      ? "Give me a concrete plan to ride this wave — promotions, combos, pricing tweaks."
      : "Give me a clear go/no-go with reasoning, and an addition plan if it's a yes.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function noveltyPlanPrompt(item: NoveltyItem): string {
  const missing = item.missingIngredients ?? [];
  const isZeroFriction = missing.length === 0;
  return [
    `Help me plan adding ${item.name} to my menu.`,
    "",
    "Context from my data:",
    `• Readiness: ${item.readinessLabel}`,
    `• Pantry match: ${Math.round(item.overlapRatio * 100)}%`,
    isZeroFriction
      ? "• My pantry already covers every ingredient"
      : `• Missing ingredients: ${missing.join(", ")}`,
    "",
    "Walk me through a concrete plan — sourcing, prep, pricing, and how to position it.",
  ].join("\n");
}

export interface MyDishContext {
  name: string;
  menuItemId: number;
  rating: number | null;
  reviewCount: number;
  performanceScore: number;
  performanceLabel: string | null;
  yourPrice: number | null;
  avgGroupPrice: number | null;
  priceDelta: number | null;
  priceLabel: string | null;
  groupSize: number | null;
}

export function myDishAnalysisPrompt(dish: MyDishContext): string {
  const reviewWord = dish.reviewCount === 1 ? "review" : "reviews";
  return [
    `Analyze ${dish.name} from my menu.`,
    "",
    "Context from my data:",
    dish.performanceLabel ? `• Performance: ${dish.performanceLabel}` : null,
    dish.rating != null
      ? `• Rating ${dish.rating.toFixed(1)}/5 across ${dish.reviewCount.toLocaleString()} ${reviewWord}`
      : "• No ratings yet",
    dish.yourPrice != null ? `• My price: ₹${dish.yourPrice.toFixed(0)}` : null,
    dish.avgGroupPrice != null && dish.groupSize
      ? `• Market avg: ₹${dish.avgGroupPrice.toFixed(0)} across ${dish.groupSize} cafes`
      : dish.avgGroupPrice != null
        ? `• Market avg: ₹${dish.avgGroupPrice.toFixed(0)}`
        : null,
    dish.priceLabel ? `• Pricing: ${dish.priceLabel}` : null,
    "",
    "Tell me what's working, what's not, and what to do next.",
  ]
    .filter(Boolean)
    .join("\n");
}
