import type { DashboardData } from "./types";

export type NotificationKind =
  | "must-have"
  | "overpriced"
  | "underpriced"
  | "performance"
  | "trending";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
}

// Derives a list of actionable alerts from the dashboard payload. Reused by the
// PageHeader bell + dropdown — replace with a real /notifications endpoint once
// the backend exposes one.
export function buildNotifications(data: DashboardData | null): Notification[] {
  if (!data) return [];

  const out: Notification[] = [];

  // Must-haves: every gap is an opportunity worth notifying about.
  for (const m of data.mustHaves) {
    out.push({
      id: `must-have-${m.canonicalDishId}`,
      kind: "must-have",
      title: `Add ${m.name}`,
      body: `${m.competitorCount} ${
        m.competitorCount === 1 ? "competitor serves" : "competitors serve"
      } it at ${m.avgRating.toFixed(1)}/5 across ${m.totalReviews.toLocaleString()} reviews.`,
    });
  }

  // Overpriced items — biggest delta first so the worst offenders surface.
  const overpriced = data.dishRankings
    .filter((d) => d.label === "overpriced")
    .sort((a, b) => b.priceDelta - a.priceDelta);
  for (const r of overpriced) {
    out.push({
      id: `overpriced-${r.menuItemId}`,
      kind: "overpriced",
      title: `${r.name} is overpriced`,
      body: `Your price ₹${r.price.toFixed(0)} is ₹${Math.round(
        r.priceDelta
      )} above the market average of ₹${r.avgGroupPrice.toFixed(0)}.`,
    });
  }

  // Underpriced items — opportunity to raise margin.
  const underpriced = data.dishRankings
    .filter((d) => d.label === "underpriced")
    .sort((a, b) => Math.abs(b.priceDelta) - Math.abs(a.priceDelta));
  for (const r of underpriced) {
    out.push({
      id: `underpriced-${r.menuItemId}`,
      kind: "underpriced",
      title: `${r.name} could earn more`,
      body: `Your price ₹${r.price.toFixed(0)} is ₹${Math.round(
        Math.abs(r.priceDelta)
      )} below market — room to raise.`,
    });
  }

  // Worst performers that need attention.
  for (const w of data.worstPerformers) {
    out.push({
      id: `performance-${w.menuItemId}`,
      kind: "performance",
      title: `${w.name} is underperforming`,
      body: `Rated ${w.rating.toFixed(1)}/5 across ${w.reviewCount} review${
        w.reviewCount === 1 ? "" : "s"
      } — score ${Math.round(w.performanceScore * 100)}/100.`,
    });
  }

  // Trending gaps (rising dishes you don't serve).
  const trendingGaps = [...data.trending]
    .filter((t) => !t.servedByCafe)
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 3);
  for (const t of trendingGaps) {
    out.push({
      id: `trending-${t.canonicalDishId}`,
      kind: "trending",
      title: `${t.name} is trending`,
      body: `Score ${Math.round(t.trendScore * 100)}/100 in your area, and it's missing from your menu.`,
    });
  }

  return out;
}
