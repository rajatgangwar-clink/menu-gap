"use client";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Layers,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trendingPlanPrompt } from "@/lib/prompts";
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
import { useDashboard } from "@/hooks/use-dashboard";
import { ErrorState, LoadingState } from "@/components/feedback/States";
import { PageHeader } from "@/components/PageHeader";
import type { DashboardData, TrendingItem } from "@/lib/types";
import { Pill } from "@/components/ui-extras/Badges";
import { MenuCoverageDonut } from "@/components/widgets/MenuCoverageDonut";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { Reveal } from "@/components/ui-extras/Reveal";
import { CountUp } from "@/components/ui-extras/CountUp";

export function NewTrending() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) return <LoadingState label="Loading trending dishes…" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  return <TrendingContent data={data} />;
}

function TrendingContent({ data }: { data: DashboardData }) {
  const {
    rising,
    declining,
    topRising,
    secondHottest,
    topDeclining,
    servedCount,
    avgScore,
  } = useMemo(() => {
    const trending = data.trending;
    // Split by the backend's `direction` field — score-based splits put
    // high-momentum falling dishes (negative growth) into "rising" by mistake.
    const risingSorted = trending
      .filter((t) => t.direction === "rising")
      .sort((a, b) => b.trendScore - a.trendScore);
    const fallingSorted = trending
      .filter((t) => t.direction === "falling")
      .sort((a, b) => b.trendScore - a.trendScore);
    const total = trending.length;
    return {
      rising: risingSorted,
      declining: fallingSorted,
      topRising: risingSorted[0],
      secondHottest: risingSorted[1],
      topDeclining: fallingSorted[0],
      servedCount: trending.filter((t) => t.servedByCafe).length,
      avgScore:
        total === 0
          ? 0
          : Math.round(
              (trending.reduce((s, t) => s + t.trendScore, 0) / total) * 100
            ),
    };
  }, [data]);

  const totalTrending = data.trending.length;
  const coverage = Math.round((servedCount / Math.max(totalTrending, 1)) * 100);

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-6 space-y-6">
        <PageHeader title="Trending" subtitle="Local trending dishes in HSR Layout" />

        <Reveal delay={80}>
          <TrendingStatsRow
            total={totalTrending}
            served={servedCount}
            coverage={coverage}
            avgScore={avgScore}
            topRising={topRising}
          />
        </Reveal>

        <div className="grid grid-cols-3 gap-6">
          {topRising && (
            <Reveal delay={220} className="col-span-2">
              <TrendingHero dish={topRising} />
            </Reveal>
          )}
          <div className="col-span-1 grid grid-rows-2 gap-6">
            {secondHottest && <CompactTrendCard dish={secondHottest} variant="rising" />}
            {topDeclining && <CompactTrendCard dish={topDeclining} variant="cooling" />}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 items-start">
          <Reveal delay={420} className="col-span-2">
            <TrendingList title="Rising in Your Area" items={rising} tone="positive" />
          </Reveal>
          <Reveal delay={480} className="col-span-1">
            <MenuCoverageDonut data={data} />
          </Reveal>
        </div>

        <Reveal delay={540}>
          <TrendingList title="Cooling Off" items={declining} tone="negative" fullWidth />
        </Reveal>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI stats row
// ─────────────────────────────────────────────────────────────────────────────

function TrendingStatsRow({
  total,
  served,
  coverage,
  avgScore,
  topRising,
}: {
  total: number;
  served: number;
  coverage: number;
  avgScore: number;
  topRising?: TrendingItem;
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard
        accent="violet"
        icon={<Layers className="w-5 h-5" />}
        label="Tracked"
        value={total}
        delay={100}
        caption="trending dishes locally"
      />
      <KpiCard
        accent="emerald"
        icon={<CheckCircle2 className="w-5 h-5" />}
        label="Coverage"
        value={coverage}
        delay={180}
        format={(v) => `${Math.round(v)}%`}
        caption={`${served} of ${total} on your menu`}
      />
      <KpiCard
        accent="amber"
        icon={<Activity className="w-5 h-5" />}
        label="Avg trend score"
        value={total ? avgScore : 0}
        empty={!total}
        delay={260}
        caption="across tracked dishes"
      />
      <KpiCard
        accent="rose"
        icon={<Flame className="w-5 h-5" />}
        label="Hottest dish"
        value={topRising ? Math.round(topRising.trendScore * 100) : 0}
        empty={!topRising}
        delay={340}
        caption={topRising ? topRising.name : "no data"}
      />
    </div>
  );
}

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
  format,
  empty = false,
  delay = 0,
}: {
  accent: "violet" | "amber" | "emerald" | "rose";
  icon: React.ReactNode;
  label: string;
  value: number;
  caption?: string;
  format?: (v: number) => string;
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
        {empty ? "—" : <CountUp to={value} format={format} delay={delay} />}
      </div>
      {caption && (
        <div
          className="relative text-sm text-muted-foreground mt-1.5 truncate"
          style={{ fontWeight: 500 }}
        >
          {caption}
        </div>
      )}
      <div className="relative mt-3 h-0.5 rounded-full bg-[#F4ECE3] overflow-hidden">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${cfg.bar}`} />
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

function TrendingHero({ dish }: { dish: TrendingItem }) {
  const router = useRouter();
  const handlePlan = () => {
    const prompt = trendingPlanPrompt(dish);
    router.push(`/ai-assistance?prompt=${encodeURIComponent(prompt)}`);
  };
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#7F5539] text-white p-8 h-full">

      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Flame className="w-4 h-4" />
            </div>
            <span
              className="text-[11px] uppercase tracking-[0.2em] opacity-90"
              style={{ fontWeight: 700 }}
            >
              Hottest right now
            </span>
            <span
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] uppercase tracking-wider"
              style={{ fontWeight: 700 }}
            >
              {dish.trendLabel}
            </span>
          </div>
          <div>
            <h2
              className="text-6xl leading-[1.0] mb-3 tracking-tight text-[#FFF8F2]"
              style={{ fontWeight: 800 }}
            >
              {dish.name}
            </h2>
            <p className="text-base opacity-80 max-w-xl">
              {dish.ownerMessage ||
                (dish.servedByCafe
                  ? "You already serve this — keep riding the wave."
                  : "Highest-momentum dish in your area, missing from your menu.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <HeroStat
            value={dish.growthRate}
            unit="%"
            label="Growth Rate"
            delay={500}
            decimals={2}
          />
          <HeroStatText value={dish.directionLabel} label="Direction" />
          <HeroStatText
            value={dish.servedByCafe ? "Yes" : "No"}
            label={dish.servedByCafe ? "On Your Menu" : "Gap to Close"}
          />
        </div>

        <button
          type="button"
          onClick={handlePlan}
          className="group self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFF8F2] text-[#7F5539] text-sm hover:bg-white transition-all shadow-lg shadow-black/20 hover:scale-[1.02]"
          style={{ fontWeight: 700 }}
          title={dish.recommendedAction || undefined}
        >
          Plan
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
  delay = 0,
  decimals = 0,
}: {
  value: number;
  unit?: string;
  label: string;
  delay?: number;
  decimals?: number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3.5 hover:bg-white/15 transition-colors">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl tracking-tight text-white" style={{ fontWeight: 700 }}>
          <CountUp to={value} delay={delay} decimals={decimals} />
        </span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mt-1" style={{ fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function HeroStatText({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3.5 hover:bg-white/15 transition-colors">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl tracking-tight text-white" style={{ fontWeight: 700 }}>
          {value}
        </span>
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mt-1" style={{ fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact cards beside hero
// ─────────────────────────────────────────────────────────────────────────────

function CompactTrendCard({
  dish,
  variant,
}: {
  dish: TrendingItem;
  variant: "rising" | "cooling";
}) {
  const rising = variant === "rising";
  const growth = dish.growthRate;
  const growthDisplay = `${growth >= 0 ? "+" : ""}${growth.toFixed(2)}%`;
  return (
    <div className="bg-card rounded-2xl p-5 border border-border flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-2 h-2 rounded-full ${rising ? "bg-[#5F8D73]" : "bg-[#D57A66]"}`}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {dish.trendLabel}
        </span>
        <div
          className={`ml-auto w-9 h-9 rounded-xl flex items-center justify-center ${
            rising ? "bg-[#EDF5F0]" : "bg-[#F8ECE8]"
          }`}
        >
          {rising ? (
            <TrendingUp className="w-5 h-5 text-[#5F8D73]" />
          ) : (
            <TrendingDown className="w-5 h-5 text-[#D57A66]" />
          )}
        </div>
      </div>
      <div className="relative flex items-baseline gap-2">
        <span
          className={`text-3xl tracking-tight leading-none ${
            rising ? "text-[#5F8D73]" : "text-[#D57A66]"
          }`}
          style={{ fontWeight: 700 }}
        >
          {growthDisplay}
        </span>
        <span className="text-sm text-muted-foreground">growth</span>
      </div>
      <div className="text-base mt-2 truncate" style={{ fontWeight: 600 }}>
        {dish.name}
      </div>
      <div className="text-sm mt-2 text-muted-foreground">{dish.directionLabel}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Self-contained list table (internal search + sort)
// ─────────────────────────────────────────────────────────────────────────────

type TrendingSortKey = "name" | "score" | "direction";

function TrendingList({
  title,
  items,
  tone,
  fullWidth,
}: {
  title: string;
  items: TrendingItem[];
  tone: "positive" | "negative";
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const positive = tone === "positive";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<TrendingSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handlePlan = (dish: TrendingItem) => {
    const prompt = trendingPlanPrompt(dish);
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
        case "direction":
          av = a.direction;
          bv = b.direction;
          break;
        case "score":
        default:
          av = a.trendScore;
          bv = b.trendScore;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [items, searchQuery, sortKey, sortDir]);

  const onSort = (key: TrendingSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };
  const dirFor = (key: TrendingSortKey) => (sortKey === key ? sortDir : null);

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
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                #
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover">
              <SortHeader direction={dirFor("name")} onClick={() => onSort("name")}>
                Dish
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center w-[140px]">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Menu Status
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center w-[150px]">
              <SortHeader
                align="center"
                direction={dirFor("direction")}
                onClick={() => onSort("direction")}
              >
                Direction
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[90px]">
              <SortHeader
                align="right"
                direction={dirFor("score")}
                onClick={() => onSort("score")}
              >
                Growth
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center pr-6 w-[100px]">
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
          {visibleItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                No matching dishes.
              </TableCell>
            </TableRow>
          ) : (
            visibleItems.map((dish, index) => {
              const growth = dish.growthRate;
              const growthDisplay = `${growth >= 0 ? "+" : ""}${growth.toFixed(2)}%`;
              return (
                <TableRow key={dish.canonicalDishId} className="border-border hover:bg-[#FCF8F3]">
                  <TableCell
                    className="pl-6 text-sm text-muted-foreground"
                    style={{ fontWeight: 600 }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <DishCell name={dish.name} subtitle={`Dish #${dish.canonicalDishId}`} />
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge servedByCafe={dish.servedByCafe} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Pill tone={positive ? "positive" : "negative"}>
                      {dish.directionLabel}
                    </Pill>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span
                      className={`text-sm ${positive ? "text-[#5F8D73]" : "text-[#D57A66]"}`}
                      style={{ fontWeight: 700 }}
                    >
                      {growthDisplay}
                    </span>
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <ActionPill tone="primary" onClick={() => handlePlan(dish)}>
                      Plan
                    </ActionPill>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      </div>
      {!fullWidth && null /* layout switch retained for future use */}
    </GlassCard>
  );
}

function StatusBadge({ servedByCafe }: { servedByCafe: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs text-white min-w-[120px] ${
        servedByCafe ? "bg-[#5F8D73]" : "bg-[#7A6D65]"
      }`}
      style={{ fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#7A6D65]" />
      {servedByCafe ? "Included" : "Not Included"}
    </span>
  );
}

