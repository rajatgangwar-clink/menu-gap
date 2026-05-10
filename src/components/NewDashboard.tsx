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
import { PricingDistributionGauge } from "@/components/widgets/PricingDistributionGauge";
import { PricingStatusList } from "@/components/widgets/PricingStatusList";
import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardData, MustHaveItem, PerformerItem } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/feedback/States";
import { buildAISuggestions } from "@/lib/insights";
import { PageHeader } from "@/components/PageHeader";
import { Pill } from "@/components/ui-extras/Badges";
import { Star, MessageSquare } from "lucide-react";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { Reveal } from "@/components/ui-extras/Reveal";
import { CountUp } from "@/components/ui-extras/CountUp";
import { ProgressRing } from "@/components/ui-extras/ProgressRing";

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

  const aiSuggestions = useMemo(() => buildAISuggestions(data), [data]);

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <PageHeader title="Dashboard" subtitle="Welcome back!" />

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

      <aside className="w-80 glass border-l border-border overflow-y-auto fade-rise" style={{ animationDelay: "300ms" }}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="absolute inset-0 rounded-lg blur-md bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-50 -z-10" />
            </div>
            <h3>AI Suggestions</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Recommendations based on your data
          </p>
        </div>
        <div className="p-6 space-y-3">
          {aiSuggestions.map((suggestion, index) => (
            <Reveal
              key={index}
              delay={400 + index * 80}
              className="relative p-4 rounded-xl glass hover-lift overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-violet-400/0 via-violet-400/60 to-violet-400/0"
              />
              <div className="flex items-start justify-between mb-2 gap-2">
                <h4 className="text-sm">{suggestion.title}</h4>
                <Pill tone={suggestion.impact === "High" ? "primary" : "caution"}>
                  {suggestion.impact}
                </Pill>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
            </Reveal>
          ))}
        </div>
      </aside>
    </div>
  );
}

function MustHaveHero({ item }: { item: MustHaveItem }) {
  const matchScore = Math.round(item.mustHaveScore * 100);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 text-white p-8 h-full glow-pulse">
      {/* Layered hero background — base gradient + drifting blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#831843]" />
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-60 blur-3xl blob-float"
        style={{
          background:
            "radial-gradient(circle, rgba(217, 70, 239, 0.55), transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-12 w-96 h-96 rounded-full opacity-50 blur-3xl blob-float"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.45), transparent 65%)",
          animationDelay: "-7s",
        }}
      />
      {/* Subtle grid texture overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Top sheen line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] opacity-90" style={{ fontWeight: 700 }}>
              Biggest opportunity
            </span>
          </div>
          <div>
            <h2
              className="text-6xl leading-[1.0] mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-100 to-violet-200"
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
          className="group self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/95 text-violet-900 text-sm hover:bg-white transition-all shadow-lg shadow-black/20 hover:scale-[1.02] hover:shadow-violet-500/30"
          style={{ fontWeight: 700 }}
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
      ? "text-amber-200"
      : tone === "bright"
        ? "text-white"
        : "text-white";
  const formatter = compact ? formatCompactNumber : undefined;
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3.5 hover:bg-white/15 transition-colors">
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
      <div
        aria-hidden
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 ${
          isTop ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      <div className="relative flex items-center gap-2 mb-3">
        <span
          className={`w-2 h-2 rounded-full ${
            isTop
              ? "bg-emerald-400 shadow-[0_0_12px] shadow-emerald-500/60"
              : "bg-rose-400 shadow-[0_0_12px] shadow-rose-500/60"
          }`}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {isTop ? "Top Performer" : "Needs Attention"}
        </span>
        <div
          className={`ml-auto w-9 h-9 rounded-xl flex items-center justify-center border ${
            isTop
              ? "bg-emerald-500/15 border-emerald-400/25"
              : "bg-rose-500/15 border-rose-400/25"
          }`}
        >
          {isTop ? (
            <TrendingUp className="w-5 h-5 text-emerald-300" />
          ) : (
            <TrendingDown className="w-5 h-5 text-rose-300" />
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
              isTop ? "text-emerald-200" : "text-rose-200"
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
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
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
  const positive = tone === "positive";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<PerformerSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
              <TrendingUp className="w-4 h-4 text-emerald-300" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-300" />
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
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 text-sm transition-colors"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
            <TableHead className="w-12 pl-6">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={{ fontWeight: 600 }}>
                #
              </span>
            </TableHead>
            <TableHead>
              <SortHeader direction={dirFor("name")} onClick={() => onSort("name")}>
                Dish
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("rating")}
                onClick={() => onSort("rating")}
              >
                <Star className="w-3 h-3" />
                Rating
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("reviews")}
                onClick={() => onSort("reviews")}
              >
                <MessageSquare className="w-3 h-3" />
                Reviews
              </SortHeader>
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
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={{ fontWeight: 600 }}>
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
              <TableRow key={dish.menuItemId} className="border-border hover:bg-white/[0.03]">
                <TableCell className="pl-6 text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
                  {index + 1}
                </TableCell>
                <TableCell>
                  <DishCell name={dish.name} subtitle={`#${dish.menuItemId}`} />
                </TableCell>
                <TableCell className="text-center text-sm" style={{ fontWeight: 600 }}>
                  {dish.rating.toFixed(1)}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {dish.reviewCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`text-sm ${
                      positive ? "text-emerald-300" : "text-rose-300"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {Math.round(dish.performanceScore * 100)}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </TableCell>
                <TableCell className="text-center pr-6">
                  <ActionPill tone="primary">Analyze</ActionPill>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </GlassCard>
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
    dot: "bg-violet-400 shadow-[0_0_12px] shadow-violet-500/60",
    iconBg: "bg-violet-500/15 border-violet-400/25",
    iconColor: "text-violet-300",
    glow: "bg-violet-500",
    bar: "from-violet-400 to-fuchsia-400",
  },
  amber: {
    dot: "bg-amber-400 shadow-[0_0_12px] shadow-amber-500/60",
    iconBg: "bg-amber-500/15 border-amber-400/25",
    iconColor: "text-amber-300",
    glow: "bg-amber-500",
    bar: "from-amber-400 to-orange-400",
  },
  emerald: {
    dot: "bg-emerald-400 shadow-[0_0_12px] shadow-emerald-500/60",
    iconBg: "bg-emerald-500/15 border-emerald-400/25",
    iconColor: "text-emerald-300",
    glow: "bg-emerald-500",
    bar: "from-emerald-400 to-cyan-400",
  },
  rose: {
    dot: "bg-rose-400 shadow-[0_0_12px] shadow-rose-500/60",
    iconBg: "bg-rose-500/15 border-rose-400/25",
    iconColor: "text-rose-300",
    glow: "bg-rose-500",
    bar: "from-rose-400 to-fuchsia-400",
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
      <div
        aria-hidden
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-25 ${cfg.glow}`}
      />
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
      <div className="relative mt-3 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${cfg.bar}`} />
      </div>
    </GlassCard>
  );
}
