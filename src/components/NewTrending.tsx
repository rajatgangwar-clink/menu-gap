"use client";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Layers,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
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
  const { rising, declining, topRising, topDeclining, servedCount, avgScore } = useMemo(() => {
    const trending = data.trending;
    const sorted = [...trending].sort((a, b) => b.trendScore - a.trendScore);
    const split = Math.ceil(sorted.length / 2);
    const total = trending.length;
    return {
      rising: sorted.slice(0, split),
      declining: sorted.slice(split).reverse(),
      topRising: sorted[0],
      topDeclining: sorted[sorted.length - 1],
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
            {topDeclining && (
              <Reveal delay={300}>
                <CompactTrendCard dish={topDeclining} variant="cooling" />
              </Reveal>
            )}
            <Reveal delay={360}>
              <CompactTrendCard
                variant="hottest"
                dish={topRising}
                servedCount={servedCount}
                total={totalTrending}
              />
            </Reveal>
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
      <div className="relative mt-3 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${cfg.bar}`} />
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

function TrendingHero({ dish }: { dish: TrendingItem }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 text-white p-8 h-full glow-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#7c2d12] to-[#831843]" />
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-60 blur-3xl blob-float"
        style={{
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.55), transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-12 w-96 h-96 rounded-full opacity-50 blur-3xl blob-float"
        style={{
          background: "radial-gradient(circle, rgba(217, 70, 239, 0.5), transparent 65%)",
          animationDelay: "-7s",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Flame className="w-4 h-4" />
            </div>
            <span
              className="text-[11px] uppercase tracking-[0.2em] opacity-90"
              style={{ fontWeight: 700 }}
            >
              Hottest right now
            </span>
          </div>
          <div>
            <h2
              className="text-6xl leading-[1.0] mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-fuchsia-200"
              style={{ fontWeight: 800 }}
            >
              {dish.name}
            </h2>
            <p className="text-base opacity-80 max-w-xl">
              {dish.servedByCafe
                ? "You already serve this — keep riding the wave."
                : "Highest-momentum dish in your area, missing from your menu."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <HeroStat
            value={Math.round(dish.trendScore * 100)}
            unit="/ 100"
            label="Trend Score"
            delay={500}
          />
          <HeroStatText value={capitalize(dish.direction)} label="Direction" />
          <HeroStatText
            value={dish.servedByCafe ? "Yes" : "No"}
            label={dish.servedByCafe ? "On Your Menu" : "Gap to Close"}
          />
        </div>

        <button
          type="button"
          className="group self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/95 text-violet-900 text-sm hover:bg-white transition-all shadow-lg shadow-black/20 hover:scale-[1.02]"
          style={{ fontWeight: 700 }}
        >
          {dish.servedByCafe ? "View performance" : "Plan addition"}
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
}: {
  value: number;
  unit?: string;
  label: string;
  delay?: number;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3.5 hover:bg-white/15 transition-colors">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl tracking-tight text-white" style={{ fontWeight: 700 }}>
          <CountUp to={value} delay={delay} />
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
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3.5 hover:bg-white/15 transition-colors">
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
  servedCount,
  total,
}: {
  dish?: TrendingItem;
  variant: "cooling" | "hottest";
  servedCount?: number;
  total?: number;
}) {
  if (variant === "cooling" && dish) {
    const score = Math.round(dish.trendScore * 100);
    return (
      <GlassCard interactive className="relative p-5 flex flex-col overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 bg-rose-500"
        />
        <div className="relative flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_12px] shadow-rose-500/60" />
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            style={{ fontWeight: 600 }}
          >
            Cooling Off
          </span>
          <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/15 border border-rose-400/25">
            <TrendingDown className="w-5 h-5 text-rose-300" />
          </div>
        </div>
        <div className="relative flex items-baseline gap-2">
          <span
            className="text-4xl tracking-tight leading-none text-rose-300"
            style={{ fontWeight: 800 }}
          >
            <CountUp to={score} delay={300} />
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <div className="relative mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="relative text-base mt-3 truncate" style={{ fontWeight: 600 }}>
          {dish.name}
        </div>
        <div className="relative text-sm mt-1 text-muted-foreground">{capitalize(dish.direction)}</div>
      </GlassCard>
    );
  }

  // hottest summary card
  const coverage = total ? Math.round(((servedCount ?? 0) / total) * 100) : 0;
  return (
    <GlassCard interactive className="relative p-5 flex flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 bg-violet-500"
      />
      <div className="relative flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_12px] shadow-violet-500/60" />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Market Activity
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/15 border border-violet-400/25">
          <Sparkles className="w-5 h-5 text-violet-300" />
        </div>
      </div>
      <div className="relative flex items-baseline gap-2">
        <span
          className="text-4xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-violet-200 to-fuchsia-300"
          style={{ fontWeight: 800 }}
        >
          <CountUp to={coverage} format={(v) => `${Math.round(v)}%`} delay={300} />
        </span>
      </div>
      <div className="relative mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
          style={{ width: `${coverage}%` }}
        />
      </div>
      <div className="relative text-base mt-3" style={{ fontWeight: 600 }}>
        Coverage
      </div>
      <div className="relative text-sm mt-1 text-muted-foreground">
        {servedCount} of {total} trending dishes on your menu
      </div>
    </GlassCard>
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
  const positive = tone === "positive";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<TrendingSortKey>("score");
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
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={{ fontWeight: 600 }}>
                Status
              </span>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("direction")}
                onClick={() => onSort("direction")}
              >
                Direction
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("score")}
                onClick={() => onSort("score")}
              >
                Trend
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
              <TableRow key={dish.canonicalDishId} className="border-border hover:bg-white/[0.03]">
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
                    {capitalize(dish.direction)}
                  </Pill>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`text-sm ${positive ? "text-emerald-300" : "text-rose-300"}`}
                    style={{ fontWeight: 700 }}
                  >
                    {Math.round(dish.trendScore * 100)}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </TableCell>
                <TableCell className="text-center pr-6">
                  <ActionPill tone="primary">
                    {dish.servedByCafe ? "View" : "Add"}
                  </ActionPill>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!fullWidth && null /* layout switch retained for future use */}
    </GlassCard>
  );
}

function StatusBadge({ servedByCafe }: { servedByCafe: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs min-w-[88px] border ${
        servedByCafe
          ? "bg-violet-500/15 border-violet-400/30 text-violet-200"
          : "bg-white/[0.06] border-white/10 text-muted-foreground"
      }`}
      style={{ fontWeight: 600 }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          servedByCafe ? "bg-violet-400 shadow-[0_0_8px] shadow-violet-400/70" : "bg-white/40"
        }`}
      />
      {servedByCafe ? "On Menu" : "Gap"}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
