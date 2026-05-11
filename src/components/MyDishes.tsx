"use client";

import {
  BarChart3,
  ChevronDown,
  DollarSign,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/hooks/use-dashboard";
import { ErrorState, LoadingState } from "@/components/feedback/States";
import { PageHeader } from "@/components/PageHeader";
import { myDishAnalysisPrompt } from "@/lib/prompts";
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
import type {
  DashboardData,
  PerformanceLabel,
  PerformanceStatus,
  PriceLabel,
} from "@/lib/types";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { Reveal } from "@/components/ui-extras/Reveal";

interface MenuDish {
  menuItemId: number;
  name: string;
  rank: number;
  rating: number | null;
  reviewCount: number;
  performanceScore: number;
  performanceLabel: PerformanceLabel | null;
  status: PerformanceStatus;
  yourPrice: number | null;
  avgGroupPrice: number | null;
  priceDelta: number | null;
  priceLabel: PriceLabel | null;
  groupSize: number | null;
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
          {currentDish && (
            <Reveal delay={120}>
              <DishShowcase dish={currentDish} />
            </Reveal>
          )}
          <Reveal delay={220}>
            <AllDishesTable
              dishes={dishes}
              selectedDishId={currentDish?.menuItemId ?? null}
              onSelect={setSelectedDishId}
            />
          </Reveal>
        </div>
      </div>

      <ComparisonSidebar
        dishes={dishes}
        dish={currentDish}
        onSelect={setSelectedDishId}
      />
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<DishSortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleAnalyze = (dish: MenuDish) => {
    const prompt = myDishAnalysisPrompt({
      name: dish.name,
      menuItemId: dish.menuItemId,
      rating: dish.rating,
      reviewCount: dish.reviewCount,
      performanceScore: dish.performanceScore,
      performanceLabel: dish.performanceLabel,
      yourPrice: dish.yourPrice,
      avgGroupPrice: dish.avgGroupPrice,
      priceDelta: dish.priceDelta,
      priceLabel: dish.priceLabel,
      groupSize: dish.groupSize,
    });
    router.push(`/ai-assistance?prompt=${encodeURIComponent(prompt)}`);
  };

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
          av = a.rating ?? -Infinity;
          bv = b.rating ?? -Infinity;
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
    <GlassCard className="overflow-hidden">
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
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#B08968]/40 focus:border-[#B08968] text-sm transition-colors"
          />
        </div>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 640 }}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="sticky top-0 z-10 bg-popover w-16 pl-6">
              <SortHeader direction={dirFor("rank")} onClick={() => onSort("rank")}>
                #
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover">
              <SortHeader direction={dirFor("name")} onClick={() => onSort("name")}>
                Dish
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[80px]">
              <SortHeader
                align="right"
                direction={dirFor("rating")}
                onClick={() => onSort("rating")}
              >
                Rating
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[90px]">
              <SortHeader
                align="right"
                direction={dirFor("reviews")}
                onClick={() => onSort("reviews")}
              >
                Reviews
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[90px]">
              <SortHeader
                align="right"
                direction={dirFor("yourPrice")}
                onClick={() => onSort("yourPrice")}
              >
                Your Price
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[80px]">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Market
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center w-[130px]">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Pricing
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center w-[150px]">
              <SortHeader
                align="center"
                direction={dirFor("score")}
                onClick={() => onSort("score")}
              >
                Performance
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center pr-6 w-[90px]">
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
              <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                No matching dishes.
              </TableCell>
            </TableRow>
          ) : (
            visibleDishes.map((dish) => (
              <TableRow
                key={dish.menuItemId}
                onClick={() => onSelect(dish.menuItemId)}
                className={`cursor-pointer transition-colors hover:bg-[#FCF8F3] ${
                  dish.menuItemId === selectedDishId ? "bg-[#F4ECE3]" : ""
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
                <TableCell className="text-right text-sm tabular-nums" style={{ fontWeight: 600 }}>
                  {dish.rating != null ? dish.rating.toFixed(1) : "—"}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  {dish.reviewCount > 0 ? dish.reviewCount.toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums" style={{ fontWeight: 600 }}>
                  {dish.yourPrice != null ? `₹${dish.yourPrice.toFixed(0)}` : "—"}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  {dish.avgGroupPrice != null ? `₹${dish.avgGroupPrice.toFixed(0)}` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <PriceTag dish={dish} />
                </TableCell>
                <TableCell className="text-center">
                  {dish.performanceLabel ? (
                    <PerformanceBadge label={dish.performanceLabel} />
                  ) : (
                    <span className="text-xs text-muted-foreground">Not rated</span>
                  )}
                </TableCell>
                <TableCell className="text-center pr-6">
                  <ActionPill
                    tone="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyze(dish);
                    }}
                  >
                    Analyze
                  </ActionPill>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </GlassCard>
  );
}

function DishShowcase({ dish }: { dish: MenuDish }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E7DED2] glass-strong">
      <div className="relative grid grid-cols-2 gap-6 p-6">
        <div className="aspect-[4/3] rounded-xl flex items-center justify-center relative overflow-hidden border border-[#E7DED2] bg-[#F4ECE3]">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <div className="relative w-24 h-24 rounded-full bg-[#7F5539] flex items-center justify-center shadow-2xl shadow-[0_4px_12px_rgba(127,85,57,0.25)] ring-1 ring-white/20">
                <span className="text-4xl text-white" style={{ fontWeight: 700 }}>
                  {dish.name[0]}
                </span>
              </div>
            </div>
            <h2
              className="text-[#2D2420]"
              style={{ fontWeight: 700 }}
            >
              {dish.name}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Performance Analysis</h3>
            <StatusBadge status={dish.status} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Star className="w-4 h-4 text-[#C38B59]" />}
              label="Rating"
              value={dish.rating != null ? `${dish.rating.toFixed(1)}/5` : "—"}
            />
            <StatCard
              icon={<Users className="w-4 h-4 text-[#5F8D73]" />}
              label="Reviews"
              value={dish.reviewCount > 0 ? dish.reviewCount.toLocaleString() : "—"}
            />
            <StatCard
              icon={<DollarSign className="w-4 h-4 text-[#5F8D73]" />}
              label="Your Price"
              value={dish.yourPrice != null ? `₹${dish.yourPrice.toFixed(0)}` : "—"}
            />
            <StatCard
              icon={<BarChart3 className="w-4 h-4 text-[#B08968]" />}
              label="Market Avg"
              value={dish.avgGroupPrice != null ? `₹${dish.avgGroupPrice.toFixed(0)}` : "—"}
            />
          </div>

          <PerformanceFactors dish={dish} />
        </div>
      </div>
    </div>
  );
}

// Real performance factors derived from the intelligence API. We bucket each
// real signal into a 0–100 score with a tone for the bar. When a signal is
// missing the factor is omitted rather than faked.
function PerformanceFactors({ dish }: { dish: MenuDish }) {
  const factors: { label: string; score: number; tone: "high" | "mid" | "low"; detail: string }[] = [];

  if (dish.rating != null) {
    const ratingScore = Math.round((dish.rating / 5) * 100);
    factors.push({
      label: "Rating",
      score: ratingScore,
      tone: dish.rating >= 4.3 ? "high" : dish.rating >= 3.7 ? "mid" : "low",
      detail: `${dish.rating.toFixed(1)} / 5`,
    });
  }

  if (dish.reviewCount > 0) {
    // Log-ish curve so a few reviews ≠ great signal, hundreds = strong signal.
    const reviewScore = Math.min(
      100,
      Math.round((Math.log10(dish.reviewCount + 1) / Math.log10(500)) * 100)
    );
    factors.push({
      label: "Review Volume",
      score: reviewScore,
      tone: dish.reviewCount >= 100 ? "high" : dish.reviewCount >= 25 ? "mid" : "low",
      detail: `${dish.reviewCount.toLocaleString()} reviews`,
    });
  }

  if (dish.priceLabel && dish.priceDelta != null) {
    // "Fair" is the ideal — closer to 0 delta is better.
    const priceScore =
      dish.priceLabel === "fair" ? 90 : dish.priceLabel === "underpriced" ? 70 : 40;
    factors.push({
      label: "Price Position",
      score: priceScore,
      tone: dish.priceLabel === "fair" ? "high" : dish.priceLabel === "underpriced" ? "mid" : "low",
      detail:
        dish.priceLabel === "fair"
          ? "Market-aligned"
          : dish.priceLabel === "underpriced"
            ? "Below market avg"
            : "Above market avg",
    });
  }

  if (dish.groupSize != null && dish.groupSize > 0) {
    // More competitors = stronger signal that the dish is well-benchmarked.
    const benchmarkScore = Math.min(100, Math.round((dish.groupSize / 10) * 100));
    factors.push({
      label: "Benchmark Strength",
      score: benchmarkScore,
      tone: dish.groupSize >= 6 ? "high" : dish.groupSize >= 3 ? "mid" : "low",
      detail: `${dish.groupSize} competitor${dish.groupSize === 1 ? "" : "s"}`,
    });
  }

  if (factors.length === 0) {
    return (
      <div>
        <div className="text-sm mb-3" style={{ fontWeight: 600 }}>
          Performance Factors
        </div>
        <p className="text-xs text-muted-foreground">
          Not enough data yet — collect a few ratings and competitor benchmarks to see this.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm mb-3" style={{ fontWeight: 600 }}>
        Performance Factors
      </div>
      <div className="space-y-3">
        {factors.map((factor) => (
          <div key={factor.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{factor.label}</span>
              <span style={{ fontWeight: 700 }}>{factor.detail}</span>
            </div>
            <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: `${factor.score}%`,
                  background: toneGradient(factor.tone),
                  boxShadow: `0 0 12px ${toneGlow(factor.tone)}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function toneGradient(tone: "high" | "mid" | "low"): string {
  switch (tone) {
    case "high":
      return "linear-gradient(90deg, #34d399, #06b6d4)";
    case "mid":
      return "linear-gradient(90deg, #fbbf24, #fb923c)";
    case "low":
      return "linear-gradient(90deg, #fb7185, #f43f5e)";
  }
}

function toneGlow(tone: "high" | "mid" | "low"): string {
  switch (tone) {
    case "high":
      return "rgba(52, 211, 153, 0.55)";
    case "mid":
      return "rgba(251, 191, 36, 0.55)";
    case "low":
      return "rgba(251, 113, 133, 0.55)";
  }
}

function PriceTag({ dish }: { dish: MenuDish }) {
  if (!dish.priceLabel) {
    return <span className="text-xs text-muted-foreground">Not benchmarked</span>;
  }
  const map = {
    underpriced: {
      bg: "bg-[#EDF5F0]",
      border: "border-[#CFE4D7]",
      text: "text-[#5F8D73]",
      dot: "bg-[#5F8D73]",
      label: "Underpriced",
    },
    fair: {
      bg: "bg-[#FBF1E1]",
      border: "border-[#EBD9B6]",
      text: "text-[#C38B59]",
      dot: "bg-[#C38B59]",
      label: "Fair",
    },
    overpriced: {
      bg: "bg-[#F8ECE8]",
      border: "border-[#EBCEC4]",
      text: "text-[#D57A66]",
      dot: "bg-[#D57A66]",
      label: "Overpriced",
    },
  } as const;
  const cfg = map[dish.priceLabel];
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs min-w-[108px] border ${cfg.bg} ${cfg.border} ${cfg.text}`}
      style={{ fontWeight: 600 }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PerformanceBadge({ label }: { label: PerformanceLabel }) {
  const tone =
    label === "Top Performer"
      ? "bg-[#EDF5F0] border-[#CFE4D7] text-[#5F8D73]"
      : label === "Reliable Item"
        ? "bg-[#EDF5F0] border-[#CFE4D7] text-[#5F8D73]"
        : label === "Needs Attention"
          ? "bg-[#F8ECE8] border-[#EBCEC4] text-[#D57A66]"
          : "bg-[#FCF8F3] border-[#E7DED2] text-[#7A6D65]";
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs min-w-[120px] border ${tone}`}
      style={{ fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: PerformanceStatus }) {
  const map = {
    Excellent: {
      bg: "bg-[#EDF5F0]",
      border: "border-[#CFE4D7]",
      text: "text-[#5F8D73]",
      dot: "bg-[#5F8D73]",
    },
    Good: {
      bg: "bg-[#F4ECE3]",
      border: "border-[#E7DED2]",
      text: "text-[#B08968]",
      dot: "bg-[#B08968]",
    },
    Average: {
      bg: "bg-[#FBF1E1]",
      border: "border-[#EBD9B6]",
      text: "text-[#C38B59]",
      dot: "bg-[#C38B59]",
    },
    Poor: {
      bg: "bg-[#F8ECE8]",
      border: "border-[#EBCEC4]",
      text: "text-[#D57A66]",
      dot: "bg-[#D57A66]",
    },
  } as const;
  const cfg = map[status];
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs min-w-[88px] border ${cfg.bg} ${cfg.border} ${cfg.text}`}
      style={{ fontWeight: 600 }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function ComparisonSidebar({
  dishes,
  dish,
  onSelect,
}: {
  dishes: MenuDish[];
  dish: MenuDish | null;
  onSelect: (id: number) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");

  if (!dish) {
    return (
      <aside className="w-80 bg-[#F2EAD9] border-l border-[#E7DED2] overflow-y-auto">
        <div className="p-6 border-b border-[#E7DED2]">
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
  const priceDeltaAbs =
    dish.yourPrice != null && dish.avgGroupPrice != null
      ? Math.round(dish.yourPrice - dish.avgGroupPrice)
      : null;

  const q = pickerQuery.trim().toLowerCase();
  const pickerOptions = q
    ? dishes.filter((d) => d.name.toLowerCase().includes(q))
    : dishes;

  return (
    <aside className="w-80 bg-[#F2EAD9] border-l border-[#E7DED2] overflow-y-auto fade-rise" style={{ animationDelay: "300ms" }}>
      <div className="p-6 border-b border-[#E7DED2]">
        <h3>Compare Performance</h3>
        <p className="text-sm text-muted-foreground mt-1">vs. Competitors</p>
      </div>

      <div className="p-6 pb-0">
        <label
          className="block text-xs uppercase tracking-wider text-muted-foreground mb-2"
          style={{ fontWeight: 600 }}
        >
          Compare dish
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setPickerOpen((o) => !o);
              setPickerQuery("");
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-[#E5D9CC] bg-[#FFFDF9] hover:border-[#B08968] transition-colors text-sm"
          >
            <span className="truncate text-left" style={{ fontWeight: 600 }}>
              {dish.name}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                pickerOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {pickerOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPickerOpen(false)}
                aria-hidden
              />
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-[#E7DED2] bg-[#FFFDF9] shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
                <div className="relative p-2 border-b border-[#EFE5DA]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search dishes…"
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-transparent text-sm outline-none placeholder:text-[#9A8F85]"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {pickerOptions.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                      No matches.
                    </div>
                  ) : (
                    pickerOptions.map((d) => (
                      <button
                        key={d.menuItemId}
                        type="button"
                        onClick={() => {
                          onSelect(d.menuItemId);
                          setPickerOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                          d.menuItemId === dish.menuItemId
                            ? "bg-[#F4ECE3] text-[#7F5539]"
                            : "hover:bg-[#FCF8F3] text-foreground"
                        }`}
                        style={{
                          fontWeight: d.menuItemId === dish.menuItemId ? 600 : 500,
                        }}
                      >
                        <span className="truncate">{d.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          #{d.rank}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
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
                priceDeltaAbs != null
                  ? `${priceDeltaAbs >= 0 ? "+" : "−"}₹${Math.abs(priceDeltaAbs)} ${
                      dish.priceLabel === "underpriced"
                        ? "below market"
                        : dish.priceLabel === "overpriced"
                          ? "above market"
                          : "vs market"
                    }`
                  : "vs market avg"
              }
              tone={dish.priceLabel === "underpriced" ? "positive" : "muted"}
            />
          )}
          {dish.performanceLabel && (
            <SidebarStat
              label="Performance"
              value={dish.performanceLabel}
              detail={
                dish.rating != null
                  ? `${dish.rating.toFixed(1)} / 5 · ${dish.reviewCount.toLocaleString()} reviews`
                  : "Insufficient ratings"
              }
              tone={
                dish.performanceLabel === "Top Performer" ||
                dish.performanceLabel === "Reliable Item"
                  ? "positive"
                  : "muted"
              }
            />
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="mb-3">Market Benchmark</h4>
          {dish.groupSize != null && dish.avgGroupPrice != null ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg glass">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                  Cafes Tracked
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl" style={{ fontWeight: 700 }}>{dish.groupSize}</span>
                  <span className="text-xs text-muted-foreground">
                    {dish.groupSize === 1 ? "competitor" : "competitors"} in your area
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg glass">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                  Avg Market Price
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl" style={{ fontWeight: 700 }}>
                    ₹{dish.avgGroupPrice.toFixed(0)}
                  </span>
                  {dish.yourPrice != null && (
                    <span className="text-xs text-muted-foreground">
                      you charge ₹{dish.yourPrice.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No competitor benchmark for this dish yet.
            </p>
          )}
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
    <div className="p-4 rounded-lg border border-[#E7DED2] bg-[#FCF8F3] hover:bg-[#F4ECE3] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontWeight: 600 }}>
          {label}
        </div>
      </div>
      <div className="text-2xl" style={{ fontWeight: 700 }}>
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
    <div className="p-4 rounded-lg border border-[#E7DED2] bg-[#FCF8F3]">
      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider" style={{ fontWeight: 600 }}>
        {label}
      </div>
      <div
        className="text-2xl mb-2 text-[#2D2420]"
        style={{ fontWeight: 700 }}
      >
        {value}
      </div>
      <p
        className={`text-xs ${tone === "positive" ? "text-[#5F8D73]" : "text-muted-foreground"}`}
      >
        {detail}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data shaping
// ─────────────────────────────────────────────────────────────────────────────

// Build the menu list by unioning performer data (rating + label) with
// dishRanking data (pricing) keyed on menuItemId. Either source alone might
// miss items: performer lists are best/worst only; dishRankings only covers
// items with competitor groups. The union ensures every known menu item
// surfaces — gracefully showing "—" where a signal is unavailable.
function buildMenuDishes(data: DashboardData): MenuDish[] {
  const map = new Map<number, MenuDish>();

  const seedFromPerformer = (
    p: DashboardData["bestPerformers"][number]
  ): void => {
    if (map.has(p.menuItemId)) return;
    map.set(p.menuItemId, {
      menuItemId: p.menuItemId,
      name: p.name,
      rank: 0,
      rating: p.rating,
      reviewCount: p.reviewCount,
      performanceScore: p.performanceScore,
      performanceLabel: p.performanceLabel as PerformanceLabel,
      status: labelToStatus(p.performanceLabel as PerformanceLabel),
      yourPrice: null,
      avgGroupPrice: null,
      priceDelta: null,
      priceLabel: null,
      groupSize: null,
    });
  };

  data.bestPerformers.forEach(seedFromPerformer);
  data.worstPerformers.forEach(seedFromPerformer);

  for (const r of data.dishRankings) {
    const existing = map.get(r.menuItemId);
    if (existing) {
      existing.yourPrice = r.price;
      existing.avgGroupPrice = r.avgGroupPrice;
      existing.priceDelta = r.priceDelta;
      existing.priceLabel = r.label;
      existing.groupSize = r.groupSize;
      if (!existing.name) existing.name = r.name;
    } else {
      map.set(r.menuItemId, {
        menuItemId: r.menuItemId,
        name: r.name,
        rank: 0,
        rating: null,
        reviewCount: 0,
        performanceScore: 0,
        performanceLabel: null,
        status: "Average",
        yourPrice: r.price,
        avgGroupPrice: r.avgGroupPrice,
        priceDelta: r.priceDelta,
        priceLabel: r.label,
        groupSize: r.groupSize,
      });
    }
  }

  const sorted = [...map.values()].sort(
    (a, b) => b.performanceScore - a.performanceScore
  );
  return sorted.map((d, idx) => ({ ...d, rank: idx + 1 }));
}

function labelToStatus(label: PerformanceLabel | null): PerformanceStatus {
  switch (label) {
    case "Top Performer":
      return "Excellent";
    case "Reliable Item":
      return "Good";
    case "Needs Attention":
      return "Poor";
    default:
      return "Average";
  }
}
