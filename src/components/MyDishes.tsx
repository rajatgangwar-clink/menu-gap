"use client";

import {
  BarChart3,
  DollarSign,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { ErrorState, LoadingState } from "@/components/feedback/States";
import { PageHeader } from "@/components/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DishCell } from "@/components/ui-extras/DishCell";
import { ActionPill, SortHeader } from "@/components/ui-extras/TableExtras";
import {
  placeholderCompetitors,
  placeholderPerformanceFactors,
} from "@/lib/mock-data";
import type {
  DashboardData,
  DishRanking,
  PerformanceStatus,
  PerformerItem,
  PriceLabel,
} from "@/lib/types";

interface MenuDish {
  menuItemId: number;
  name: string;
  rank: number;
  rating: number;
  reviewCount: number;
  performanceScore: number;
  status: PerformanceStatus;
  yourPrice: number | null;
  avgGroupPrice: number | null;
  priceDelta: number | null;
  priceLabel: PriceLabel | null;
}

export function MyDishes() {
  const { data, loading, error, refetch } = useDashboard();
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);

  const dishes = useMemo(() => (data ? buildMenuDishes(data) : []), [data]);

  const currentDish =
    dishes.find((d) => d.menuItemId === selectedDishId) ?? dishes[0] ?? null;

  if (loading) return <LoadingState label="Loading your menu…" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <PageHeader title="My Dishes" subtitle="Detailed performance analysis of your menu" />
          {currentDish && <DishShowcase dish={currentDish} />}

          <AllDishesTable
            dishes={dishes}
            selectedDishId={currentDish?.menuItemId ?? null}
            onSelect={setSelectedDishId}
          />
        </div>
      </div>

      <ComparisonSidebar dish={currentDish} />
    </div>
  );
}

type DishSortKey = "rank" | "name" | "rating" | "reviews" | "yourPrice" | "score";

function AllDishesTable({
  dishes,
  selectedDishId,
  onSelect,
}: {
  dishes: MenuDish[];
  selectedDishId: number | null;
  onSelect: (id: number) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<DishSortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const visibleDishes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q ? dishes.filter((d) => d.name.toLowerCase().includes(q)) : dishes;
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "name":
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case "rating":
          av = a.rating;
          bv = b.rating;
          break;
        case "reviews":
          av = a.reviewCount;
          bv = b.reviewCount;
          break;
        case "yourPrice":
          av = a.yourPrice ?? -Infinity;
          bv = b.yourPrice ?? -Infinity;
          break;
        case "score":
          av = a.performanceScore;
          bv = b.performanceScore;
          break;
        case "rank":
        default:
          av = a.rank;
          bv = b.rank;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [dishes, searchQuery, sortKey, sortDir]);

  const onSort = (key: DishSortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" || key === "rank" ? "asc" : "desc");
    }
  };
  const dirFor = (key: DishSortKey) => (sortKey === key ? sortDir : null);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3>All Dishes Performance</h3>
            <p className="text-sm text-muted-foreground mt-1">Ranked by overall performance</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-12 pl-6">
              <SortHeader direction={dirFor("rank")} onClick={() => onSort("rank")}>
                #
              </SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader direction={dirFor("name")} onClick={() => onSort("name")}>
                Dish
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Status
              </span>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("rating")}
                onClick={() => onSort("rating")}
              >
                Rating
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("reviews")}
                onClick={() => onSort("reviews")}
              >
                Reviews
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("yourPrice")}
                onClick={() => onSort("yourPrice")}
              >
                Your Price
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Market
              </span>
            </TableHead>
            <TableHead className="text-center">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Pricing
              </span>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("score")}
                onClick={() => onSort("score")}
              >
                Score
              </SortHeader>
            </TableHead>
            <TableHead className="text-center pr-6">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Actions
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleDishes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                No matching dishes.
              </TableCell>
            </TableRow>
          ) : (
            visibleDishes.map((dish) => (
              <TableRow
                key={dish.menuItemId}
                onClick={() => onSelect(dish.menuItemId)}
                className={`cursor-pointer ${
                  dish.menuItemId === selectedDishId ? "bg-accent/40" : ""
                }`}
              >
                <TableCell
                  className="pl-6 text-sm text-muted-foreground"
                  style={{ fontWeight: 600 }}
                >
                  {dish.rank}
                </TableCell>
                <TableCell>
                  <DishCell name={dish.name} subtitle={`#${dish.menuItemId}`} />
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={dish.status} />
                </TableCell>
                <TableCell className="text-center text-sm" style={{ fontWeight: 600 }}>
                  {dish.rating.toFixed(1)}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {dish.reviewCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-center text-sm" style={{ fontWeight: 600 }}>
                  {dish.yourPrice != null ? `₹${dish.yourPrice.toFixed(0)}` : "—"}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {dish.avgGroupPrice != null ? `₹${dish.avgGroupPrice.toFixed(0)}` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <PriceTag dish={dish} />
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-primary" style={{ fontWeight: 700 }}>
                    {Math.round(dish.performanceScore * 100)}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </TableCell>
                <TableCell className="text-center pr-6">
                  <ActionPill tone="primary">View</ActionPill>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DishShowcase({ dish }: { dish: MenuDish }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-4xl">{dish.name[0]}</span>
            </div>
            <h2>{dish.name}</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Performance Analysis</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${statusColor(dish.status)}`}>
              {dish.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Star className="w-4 h-4 text-primary" />}
              label="Rating"
              value={`${dish.rating.toFixed(1)}/5`}
            />
            <StatCard
              icon={<Users className="w-4 h-4 text-primary" />}
              label="Reviews"
              value={dish.reviewCount.toLocaleString()}
            />
            <StatCard
              icon={<DollarSign className="w-4 h-4 text-primary" />}
              label="Your Price"
              value={dish.yourPrice != null ? `₹${dish.yourPrice.toFixed(0)}` : "—"}
            />
            <StatCard
              icon={<BarChart3 className="w-4 h-4 text-primary" />}
              label="Market Avg"
              value={dish.avgGroupPrice != null ? `₹${dish.avgGroupPrice.toFixed(0)}` : "—"}
            />
          </div>

          <div>
            <div className="text-sm mb-3" style={{ fontWeight: 600 }}>
              Performance Factors
            </div>
            <div className="space-y-2">
              {placeholderPerformanceFactors.map((factor, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{factor.label}</span>
                    <span style={{ fontWeight: 600 }}>{factor.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${factor.score}%`,
                        backgroundColor: factorColor(factor.status),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceTag({ dish }: { dish: MenuDish }) {
  if (!dish.priceLabel) {
    return <span className="text-xs text-muted-foreground">Not benchmarked</span>;
  }
  const map = {
    underpriced: { bg: "bg-emerald-600", label: "Underpriced" },
    fair: { bg: "bg-amber-500", label: "Fair" },
    overpriced: { bg: "bg-rose-600", label: "Overpriced" },
  } as const;
  const cfg = map[dish.priceLabel];
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs text-white min-w-[108px] ${cfg.bg}`}
      style={{ fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: PerformanceStatus }) {
  const map = {
    Excellent: { bg: "bg-emerald-600" },
    Good: { bg: "bg-indigo-600" },
    Average: { bg: "bg-amber-500" },
    Poor: { bg: "bg-rose-600" },
  } as const;
  const cfg = map[status];
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs text-white min-w-[88px] ${cfg.bg}`}
      style={{ fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
      {status}
    </span>
  );
}

function ComparisonSidebar({ dish }: { dish: MenuDish | null }) {
  if (!dish) {
    return (
      <aside className="w-80 bg-card border-l border-border overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h3>Compare Performance</h3>
          <p className="text-sm text-muted-foreground mt-1">Select a dish to compare</p>
        </div>
      </aside>
    );
  }

  const priceDeltaPct =
    dish.yourPrice != null && dish.avgGroupPrice
      ? Math.round(((dish.yourPrice - dish.avgGroupPrice) / dish.avgGroupPrice) * 100)
      : null;

  return (
    <aside className="w-80 bg-card border-l border-border overflow-y-auto">
      <div className="p-6 border-b border-border">
        <h3>Compare Performance</h3>
        <p className="text-sm text-muted-foreground mt-1">vs. Competitors</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-4">
          <SidebarStat
            label="Rank in Your Menu"
            value={`#${dish.rank}`}
            detail={dish.status}
            tone={dish.status === "Excellent" || dish.status === "Good" ? "positive" : "muted"}
          />
          {priceDeltaPct != null && (
            <SidebarStat
              label="Price vs Market"
              value={`${priceDeltaPct >= 0 ? "+" : ""}${priceDeltaPct}%`}
              detail={
                dish.priceLabel === "underpriced"
                  ? "Room to raise"
                  : dish.priceLabel === "overpriced"
                    ? "Above competitors"
                    : "Market-aligned"
              }
              tone={dish.priceLabel === "underpriced" ? "positive" : "muted"}
            />
          )}
          <SidebarStat
            label="Performance Score"
            value={`${Math.round(dish.performanceScore * 100)}`}
            detail="Out of 100"
            tone={dish.performanceScore >= 0.7 ? "positive" : "muted"}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="mb-3">Sample Competitors</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Backend will surface real competitor matches once the endpoint is wired.
          </p>
          <div className="space-y-3">
            {placeholderCompetitors.map((comp, index) => (
              <div key={comp.name} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm" style={{ fontWeight: 600 }}>
                    {comp.name}
                  </div>
                  <span className="text-xs text-muted-foreground">#{index + 2}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{comp.rating}/5</span>
                  <span>₹{comp.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-accent/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="text-2xl" style={{ fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function SidebarStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "positive" | "muted";
}) {
  return (
    <div className="p-4 bg-accent/50 rounded-lg">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl mb-2" style={{ fontWeight: 600 }}>
        {value}
      </div>
      <p
        className={`text-xs ${tone === "positive" ? "text-status-positive-foreground" : "text-muted-foreground"}`}
      >
        {detail}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data shaping
// ─────────────────────────────────────────────────────────────────────────────

function buildMenuDishes(data: DashboardData): MenuDish[] {
  const performers = dedupeById([...data.bestPerformers, ...data.worstPerformers]);
  const sorted = performers.sort((a, b) => b.performanceScore - a.performanceScore);
  const rankingByName = new Map(
    data.dishRankings.map((r) => [r.name.toLowerCase(), r] as const)
  );

  return sorted.map((p, idx) => {
    const ranking = rankingByName.get(p.name.toLowerCase());
    return toMenuDish(p, idx + 1, ranking);
  });
}

function dedupeById(items: PerformerItem[]): PerformerItem[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.menuItemId)) return false;
    seen.add(item.menuItemId);
    return true;
  });
}

function toMenuDish(
  performer: PerformerItem,
  rank: number,
  ranking: DishRanking | undefined
): MenuDish {
  return {
    menuItemId: performer.menuItemId,
    name: performer.name,
    rank,
    rating: performer.rating,
    reviewCount: performer.reviewCount,
    performanceScore: performer.performanceScore,
    status: scoreToStatus(performer.performanceScore),
    yourPrice: ranking?.price ?? null,
    avgGroupPrice: ranking?.avgGroupPrice ?? null,
    priceDelta: ranking?.priceDelta ?? null,
    priceLabel: ranking?.label ?? null,
  };
}

function scoreToStatus(score: number): PerformanceStatus {
  if (score >= 0.8) return "Excellent";
  if (score >= 0.6) return "Good";
  if (score >= 0.4) return "Average";
  return "Poor";
}

function statusColor(status: PerformanceStatus): string {
  switch (status) {
    case "Excellent":
      return "bg-status-positive text-status-positive-foreground";
    case "Good":
      return "bg-status-caution text-status-caution-foreground";
    case "Average":
      return "bg-muted text-muted-foreground";
    case "Poor":
      return "bg-status-negative text-status-negative-foreground";
  }
}

function factorColor(status: string): string {
  switch (status) {
    case "excellent":
      return "#10b981";
    case "good":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
}

