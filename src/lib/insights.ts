import type { DashboardData, DishRanking } from "./types";

export interface AISuggestion {
  title: string;
  reason: string;
  impact: "High" | "Medium" | "Low";
}

// Derives quick recommendations from the dashboard payload so the right-hand
// suggestions panel reflects real data instead of static copy.
export function buildAISuggestions(data: DashboardData): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  const topMustHave = data.mustHaves[0];
  if (topMustHave) {
    suggestions.push({
      title: `Add ${topMustHave.name}`,
      reason: `${topMustHave.competitorCount} competitors serve it with avg rating ${topMustHave.avgRating.toFixed(1)}/5 across ${topMustHave.totalReviews} reviews.`,
      impact: topMustHave.mustHaveScore >= 0.85 ? "High" : "Medium",
    });
  }

  const topNovelty = data.novelty[0];
  if (topNovelty) {
    const missing = topNovelty.missingIngredients.length;
    suggestions.push({
      title: `Try ${topNovelty.name}`,
      reason:
        missing === 0
          ? "You have every ingredient on hand — zero-friction addition."
          : `You're only missing ${missing} ingredient${missing > 1 ? "s" : ""}: ${topNovelty.missingIngredients.join(", ")}.`,
      impact: topNovelty.noveltyScore >= 0.8 ? "High" : "Medium",
    });
  }

  const worstPerformer = data.worstPerformers[0];
  if (worstPerformer) {
    suggestions.push({
      title: `Review ${worstPerformer.name}`,
      reason: `Performance score ${Math.round(worstPerformer.performanceScore * 100)}/100, rated ${worstPerformer.rating.toFixed(1)}/5 on ${worstPerformer.reviewCount} reviews.`,
      impact: "High",
    });
  }

  const underpriced = pickPricing(data.dishRankings, "underpriced");
  if (underpriced) {
    suggestions.push({
      title: `Reprice ${underpriced.name}`,
      reason: `Currently ₹${underpriced.price.toFixed(0)} vs competitor average ₹${underpriced.avgGroupPrice.toFixed(0)} (₹${Math.abs(underpriced.priceDelta).toFixed(0)} below market).`,
      impact: "Medium",
    });
  }

  return suggestions.slice(0, 4);
}

function pickPricing(
  rankings: DishRanking[],
  label: "underpriced" | "overpriced"
): DishRanking | undefined {
  return rankings
    .filter((r) => r.label === label)
    .sort((a, b) => Math.abs(b.priceDelta) - Math.abs(a.priceDelta))[0];
}
