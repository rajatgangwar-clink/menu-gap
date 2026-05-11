"use client";

import {
  ArrowUpRight,
  Activity,
  AlertTriangle,
  Layers,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { Reveal } from "@/components/ui-extras/Reveal";
import { CountUp } from "@/components/ui-extras/CountUp";
import { ProgressRing } from "@/components/ui-extras/ProgressRing";
import { PricingDistributionGauge } from "@/components/widgets/PricingDistributionGauge";
import { PricingStatusList } from "@/components/widgets/PricingStatusList";
import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardData, MustHaveItem, PerformerItem } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/feedback/States";
import { PageHeader } from "@/components/PageHeader";
import { Star, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRestaurant } from "@/hooks/use-restaurant";
import {
  mustHaveAnalysisPrompt,
  topPerformerAnalysisPrompt,
  worstPerformerAnalysisPrompt,
} from "@/lib/prompts";

export function NewDashboard() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  return <DashboardContent data={data} />;
}

interface DashboardContentProps {
  data: DashboardData;
}

function DashboardContent({ data }: DashboardContentProps) {
  const topMustHave = data.mustHaves[0];
  const topPerformer = data.bestPerformers[0];
  const worstPerformer = data.worstPerformers[0];
  const restaurant = useRestaurant();

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Dashboard"
            subtitle={
              restaurant?.name
                ? `Welcome back to ${restaurant.name}!`
                : "Welcome back!"
            }
          />

          <Reveal delay={80}>
            <DashboardStatsRow data={data} />
          </Reveal>

          <div className="grid grid-cols-3 gap-6">
            {topMustHave && (
              <Reveal delay={220} className="col-span-2">
                <MustHaveHero item={topMustHave} />
              </Reveal>
            )}
            <div className="col-span-1 grid grid-rows-2 gap-6">
              {topPerformer && (
                <Reveal delay={300}>
                  <CompactPerformerCard item={topPerformer} variant="top" />
                </Reveal>
              )}
              {worstPerformer && (
                <Reveal delay={360}>
                  <CompactPerformerCard item={worstPerformer} variant="worst" />
                </Reveal>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Reveal delay={420}>
              <PricingDistributionGauge data={data} />
            </Reveal>
            <Reveal delay={480}>
              <PricingStatusList data={data} />
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Reveal delay={540}>
              <PerformerList
                title="Top Performing Dishes"
                items={data.bestPerformers}
                tone="positive"
              />
            </Reveal>
            <Reveal delay={600}>
              <PerformerList
                title="Worst Performing Dishes"
                items={data.worstPerformers}
                tone="negative"
              />
            </Reveal>
          </div>
        </div>
      </div>

      <aside className="w-80 bg-[#F2EAD9] border-l border-[#E7DED2] overflow-y-auto fade-rise" style={{ animationDelay: "300ms" }}>
        <div className="p-6 border-b border-[#E7DED2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7F5539] flex items-center justify-center shadow-[0_4px_12px_rgba(127,85,57,0.25)]">
              <Sparkles className="w-5 h-5 text-[#FFE7D1]" />
            </div>
            <h3>AI Suggestions</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {data.mustHaves.length === 0
              ? "No must-have opportunities right now."
              : `${data.mustHaves.length} must-have ${
                  data.mustHaves.length === 1 ? "opportunity" : "opportunities"
                } in your area`}
          </p>
        </div>
        <div className="p-6 space-y-3">
          {data.mustHaves.map((m) => (
            <MustHaveSuggestionCard key={m.canonicalDishId} item={m} />
          ))}
        </div>
      </aside>
    </div>
  );
}

function MustHaveHero({ item }: { item: MustHaveItem }) {
  const router = useRouter();
  const matchScore = Math.round(item.mustHaveScore * 100);

  const handleAnalyze = () => {
    const prompt = mustHaveAnalysisPrompt(item);
    router.push(`/ai-assistance?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#7F5539] text-white p-8 h-full">

      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] opacity-90" style={{ fontWeight: 700 }}>
              Biggest opportunity
            </span>
            <span
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] uppercase tracking-wider"
              style={{ fontWeight: 700 }}
            >
              {item.opportunityLabel}
            </span>
          </div>
          <div>
            <h2
              className="text-6xl leading-[1.0] mb-3 tracking-tight text-[#FFF8F2]"
              style={{ fontWeight: 800 }}
            >
              {item.name}
            </h2>
            <p className="text-base opacity-80 max-w-xl">
              {`${item.competitorCount} ${
                item.competitorCount === 1 ? "competitor" : "competitors"
              } serve this with strong reviews. You don't — adding it could close a real gap.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <HeroStat
            value={item.avgRating}
            decimals={1}
            unit="/ 5"
            label="Avg Rating"
            tone="warm"
            delay={500}
          />
          <HeroStat
            value={item.totalReviews}
            label={item.totalReviews === 1 ? "Review" : "Reviews"}
            compact
            delay={620}
          />
          <HeroStat
            value={item.competitorCount}
            label={item.competitorCount === 1 ? "Cafe Serves It" : "Cafes Serve It"}
            delay={740}
          />
          <HeroStat
            value={matchScore}
            unit="/ 100"
            label="Must-Have Score"
            tone="bright"
            delay={860}
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
          style={{ fontWeight: 600 }}
        >
          Analyze this dish
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
}

function HeroStat({
  value,
  unit,
  label,
  tone = "default",
  decimals = 0,
  compact = false,
  delay = 0,
}: {
  value: number;
  unit?: string;
  label: string;
  tone?: "default" | "warm" | "bright";
  decimals?: number;
  compact?: boolean;
  delay?: number;
}) {
  const accent =
    tone === "warm"
      ? "text-[#FFE7D1]"
      : tone === "bright"
        ? "text-white"
        : "text-white";
  const formatter = compact ? formatCompactNumber : undefined;
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3.5 hover:bg-white/15 transition-colors">
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl tracking-tight ${accent}`} style={{ fontWeight: 700 }}>
          <CountUp to={value} decimals={decimals} format={formatter} delay={delay} />
        </span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mt-1" style={{ fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function formatCompactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return Math.round(n).toLocaleString();
}

function MustHaveSuggestionCard({ item }: { item: MustHaveItem }) {
  const router = useRouter();
  const score = Math.round(item.mustHaveScore * 100);
  // Use the backend's qualitative label directly instead of bucketing a score.
  const impact = item.opportunityLabel;
  const impactStyle =
    impact === "High Demand Gap"
      ? "bg-[#F4ECE3] text-[#7F5539]"
      : impact === "Strong Opportunity"
        ? "bg-[#EDF5F0] text-[#5F8D73]"
        : impact === "Worth Considering"
          ? "bg-[#FBF1E1] text-[#C38B59]"
          : "bg-[#FCF8F3] text-[#7A6D65]";

  const handleAnalyze = () => {
    const prompt = mustHaveAnalysisPrompt(item);
    router.push(`/ai-assistance?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden">
      {/* subtle decorative accent */}
      <div className="relative">
        {/* Top: icon + dish name + impact pill */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#7F5539] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <h4 className="text-sm truncate" style={{ fontWeight: 700 }}>
                {item.name}
              </h4>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${impactStyle}`}
                style={{ fontWeight: 700 }}
              >
                {impact}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.competitorCount} {item.competitorCount === 1 ? "competitor" : "competitors"}{" "}
              serve this dish
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FBF1E1] text-[#C38B59] text-xs"
            style={{ fontWeight: 600 }}
          >
            <Star className="w-3 h-3 fill-[#C38B59] text-[#C38B59]" />
            {item.avgRating.toFixed(1)}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FCF8F3] text-[#7A6D65] text-xs"
            style={{ fontWeight: 600 }}
          >
            <MessageSquare className="w-3 h-3" />
            {formatReviewCount(item.totalReviews)}
          </span>
        </div>

        {/* Score progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
              style={{ fontWeight: 600 }}
            >
              Match Score
            </span>
            <span className="text-sm" style={{ fontWeight: 700 }}>
              <span className="text-primary">{score}</span>
              <span className="text-muted-foreground text-xs">/100</span>
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B08968] rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Analyze CTA */}
        <button
          type="button"
          onClick={handleAnalyze}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
          style={{ fontWeight: 600 }}
        >
          Analyze
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function formatReviewCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

function CompactPerformerCard({
  item,
  variant,
}: {
  item: PerformerItem;
  variant: "top" | "worst";
}) {
  const isTop = variant === "top";
  const score = Math.round(item.performanceScore * 100);
  const ringColors = isTop
    ? { from: "#34d399", to: "#22d3ee" }
    : { from: "#fb7185", to: "#f59e0b" };
  return (
    <GlassCard interactive className="relative p-5 flex flex-col overflow-hidden">
      {/* Corner color glow that signals tone without dominating */}
      <div className="relative flex items-center gap-2 mb-3">
        <span
          className={`w-2 h-2 rounded-full ${
            isTop
              ? "bg-[#5F8D73]"
              : "bg-[#D57A66]"
          }`}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {item.performanceLabel}
        </span>
        <div
          className={`ml-auto w-9 h-9 rounded-xl flex items-center justify-center border ${
            isTop
              ? "bg-[#EDF5F0] border-[#CFE4D7]"
              : "bg-[#F8ECE8] border-[#EBCEC4]"
          }`}
        >
          {isTop ? (
            <TrendingUp className="w-5 h-5 text-[#5F8D73]" />
          ) : (
            <TrendingDown className="w-5 h-5 text-[#D57A66]" />
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <ProgressRing
          value={score}
          size={84}
          stroke={7}
          from={ringColors.from}
          to={ringColors.to}
          delay={300}
        >
          <span
            className={`text-2xl tracking-tight ${
              isTop ? "text-[#5F8D73]" : "text-[#D57A66]"
            }`}
            style={{ fontWeight: 800 }}
          >
            <CountUp to={score} delay={300} />
          </span>
          <span
            className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5"
            style={{ fontWeight: 600 }}
          >
            / 100
          </span>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <div className="text-base truncate" style={{ fontWeight: 600 }}>
            {item.name}
          </div>
          <div className="text-sm mt-1 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-[#C38B59] text-[#C38B59]" />
            <span style={{ fontWeight: 700 }}>{item.rating.toFixed(1)}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {item.reviewCount.toLocaleString()}{" "}
            {item.reviewCount === 1 ? "review" : "reviews"}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

type PerformerSortKey = "name" | "rating" | "reviews" | "score";

function PerformerList({
  title,
  items,
  tone,
}: {
  title: string;
  items: PerformerItem[];
  tone: "positive" | "negative";
}) {
  const router = useRouter();
  const positive = tone === "positive";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<PerformerSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleAnalyze = (dish: PerformerItem) => {
    const prompt = positive
      ? topPerformerAnalysisPrompt(dish)
      : worstPerformerAnalysisPrompt(dish);
    router.push(`/ai-assistance?prompt=${encodeURIComponent(prompt)}`);
  };

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? items.filter((d) => d.name.toLowerCase().includes(q))
      : items;
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
        case "score":
        default:
          av = a.performanceScore;
          bv = b.performanceScore;
          break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [items, searchQuery, sortKey, sortDir]);

  const onSort = (key: PerformerSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const dirFor = (key: PerformerSortKey) => (sortKey === key ? sortDir : null);

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            {positive ? (
              <TrendingUp className="w-4 h-4 text-[#5F8D73]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#D57A66]" />
            )}
            {title}
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dishes..."
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
              <span className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontWeight: 600 }}>
                #
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover">
              <SortHeader direction={dirFor("name")} onClick={() => onSort("name")}>
                Dish
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center w-[80px]">
              <SortHeader
                align="center"
                direction={dirFor("rating")}
                onClick={() => onSort("rating")}
              >
                <Star className="w-3 h-3" />
                Rating
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center w-[90px]">
              <SortHeader
                align="center"
                direction={dirFor("reviews")}
                onClick={() => onSort("reviews")}
              >
                <MessageSquare className="w-3 h-3" />
                Reviews
              </SortHeader>
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
            <TableHead className="sticky top-0 z-10 bg-popover text-center pr-6 w-[110px]">
              <span className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontWeight: 600 }}>
                Actions
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                No matching dishes.
              </TableCell>
            </TableRow>
          ) : (
            visibleItems.map((dish, index) => (
              <TableRow key={dish.menuItemId} className="border-border hover:bg-[#FCF8F3]">
                <TableCell className="pl-6 text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
                  {index + 1}
                </TableCell>
                <TableCell>
                  <DishCell name={dish.name} subtitle={`#${dish.menuItemId}`} />
                </TableCell>
                <TableCell className="text-center text-sm tabular-nums" style={{ fontWeight: 600 }}>
                  {dish.rating.toFixed(1)}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground tabular-nums">
                  {dish.reviewCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <PerformanceBadge label={dish.performanceLabel} />
                </TableCell>
                <TableCell className="text-center pr-6">
                  <ActionPill tone="primary" onClick={() => handleAnalyze(dish)}>
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

function PerformanceBadge({ label }: { label: string }) {
  const tone =
    label === "Top Performer"
      ? "bg-[#5F8D73] text-white"
      : label === "Reliable Item"
        ? "bg-[#5F8D73] text-white"
        : label === "Needs Attention"
          ? "bg-[#D57A66] text-white"
          : "bg-[#7A6D65] text-white";
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs min-w-[120px] ${tone}`}
      style={{ fontWeight: 600 }}
    >
      {label}
    </span>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Dashboard KPI stats row — summary metrics only (no trending/coverage —
// those belong on the Trending tab; pricing distribution on My Dishes).
// ─────────────────────────────────────────────────────────────────────────────

function DashboardStatsRow({ data }: { data: DashboardData }) {
  const menuItemIds = new Set<number>();
  data.bestPerformers.forEach((p) => menuItemIds.add(p.menuItemId));
  data.worstPerformers.forEach((p) => menuItemIds.add(p.menuItemId));
  data.dishRankings.forEach((d) => menuItemIds.add(d.menuItemId));
  const menuItems = menuItemIds.size;

  const performers = [...data.bestPerformers, ...data.worstPerformers];
  const totalReviews = performers.reduce((s, p) => s + p.reviewCount, 0);
  const avgRating =
    performers.length === 0
      ? 0
      : performers.reduce((s, p) => s + p.rating, 0) / performers.length;

  const mustHavesCount = data.mustHaves.length;
  const topMustHave = data.mustHaves[0];

  const fairCount = data.dishRankings.filter((r) => r.label === "fair").length;
  const overpricedCount = data.dishRankings.filter((r) => r.label === "overpriced").length;
  const topOverpriced = data.dishRankings
    .filter((r) => r.label === "overpriced")
    .sort((a, b) => b.priceDelta - a.priceDelta)[0];

  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard
        accent="violet"
        icon={<Layers className="w-5 h-5" />}
        label="Menu items"
        value={menuItems}
        delay={120}
        caption={
          data.dishRankings.length
            ? `${fairCount} fairly priced`
            : "no priced items"
        }
      />
      <KpiCard
        accent="amber"
        icon={<Activity className="w-5 h-5" />}
        label="Avg rating"
        value={performers.length ? avgRating : 0}
        decimals={1}
        empty={!performers.length}
        delay={200}
        caption={
          performers.length
            ? `from ${totalReviews.toLocaleString()} reviews`
            : "no reviews yet"
        }
      />
      <KpiCard
        accent="emerald"
        icon={<Target className="w-5 h-5" />}
        label="Must-haves"
        value={mustHavesCount}
        delay={280}
        caption={topMustHave ? `Top: ${topMustHave.name}` : "no opportunities"}
      />
      <KpiCard
        accent="rose"
        icon={<AlertTriangle className="w-5 h-5" />}
        label="Pricing alerts"
        value={overpricedCount}
        delay={360}
        caption={
          overpricedCount === 0
            ? "all in range"
            : topOverpriced
              ? `${topOverpriced.name} +₹${Math.round(topOverpriced.priceDelta)}`
              : "review pricing"
        }
      />
    </div>
  );
}

// Mapping table for accent-driven styling. Tailwind needs full class strings
// at build time, so we list each combo explicitly rather than interpolating.
const KPI_ACCENT: Record<
  "violet" | "amber" | "emerald" | "rose",
  { dot: string; iconBg: string; iconColor: string; glow: string; bar: string }
> = {
  violet: {
    dot: "bg-[#B08968]",
    iconBg: "bg-[#F4ECE3] border-[#E7DED2]",
    iconColor: "text-[#B08968]",
    glow: "bg-[#7F5539]",
    bar: "from-[#B08968] to-[#B08968]",
  },
  amber: {
    dot: "bg-[#C38B59]",
    iconBg: "bg-[#FBF1E1] border-[#EBD9B6]",
    iconColor: "text-[#C38B59]",
    glow: "bg-[#C38B59]",
    bar: "from-[#C38B59] to-[#C38B59]",
  },
  emerald: {
    dot: "bg-[#5F8D73]",
    iconBg: "bg-[#EDF5F0] border-[#CFE4D7]",
    iconColor: "text-[#5F8D73]",
    glow: "bg-[#5F8D73]",
    bar: "from-[#5F8D73] to-[#5F8D73]",
  },
  rose: {
    dot: "bg-[#D57A66]",
    iconBg: "bg-[#F8ECE8] border-[#EBCEC4]",
    iconColor: "text-[#D57A66]",
    glow: "bg-[#D57A66]",
    bar: "from-[#D57A66] to-[#D57A66]",
  },
};

function KpiCard({
  accent,
  icon,
  label,
  value,
  caption,
  decimals = 0,
  empty = false,
  delay = 0,
}: {
  accent: "violet" | "amber" | "emerald" | "rose";
  icon: React.ReactNode;
  label: string;
  value: number;
  caption?: string;
  decimals?: number;
  empty?: boolean;
  delay?: number;
}) {
  const cfg = KPI_ACCENT[accent];
  return (
    <GlassCard interactive className="relative p-5 overflow-hidden">
      <div className="relative flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {label}
        </span>
        <div
          className={`ml-auto w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.iconBg} ${cfg.iconColor}`}
        >
          {icon}
        </div>
      </div>
      <div className="relative text-3xl tracking-tight" style={{ fontWeight: 800 }}>
        {empty ? (
          "—"
        ) : (
          <CountUp to={value} decimals={decimals} delay={delay} />
        )}
      </div>
      {caption && (
        <div
          className="relative text-sm text-muted-foreground mt-1.5 truncate"
          style={{ fontWeight: 500 }}
        >
          {caption}
        </div>
      )}
      {/* Bottom accent bar */}
      <div className="relative mt-3 h-0.5 rounded-full bg-[#F4ECE3] overflow-hidden">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${cfg.bar}`} />
      </div>
    </GlassCard>
  );
}
