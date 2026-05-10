"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Layers,
  Search,
  Sparkles,
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
import type { DashboardData, NoveltyItem } from "@/lib/types";
import { Pill } from "@/components/ui-extras/Badges";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { Reveal } from "@/components/ui-extras/Reveal";
import { CountUp } from "@/components/ui-extras/CountUp";

export function Novelty() {
  const { data, loading, error, refetch } = useDashboard();
  if (loading) return <LoadingState label="Loading novelty insights…" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;
  return <NoveltyContent data={data} />;
}

function NoveltyContent({ data }: { data: DashboardData }) {
  const novelty = data.novelty;
  const top = novelty[0];
  const zeroFriction = useMemo(
    () => novelty.filter((n) => n.missingIngredients.length === 0),
    [novelty]
  );
  const avgPantryMatch = useMemo(() => {
    if (novelty.length === 0) return 0;
    return Math.round(
      (novelty.reduce((s, n) => s + n.overlapRatio, 0) / novelty.length) * 100
    );
  }, [novelty]);
  const avgNoveltyScore = useMemo(() => {
    if (novelty.length === 0) return 0;
    return Math.round(
      (novelty.reduce((s, n) => s + n.noveltyScore, 0) / novelty.length) * 100
    );
  }, [novelty]);

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-6 space-y-6">
        <PageHeader
          title="Novelty"
          subtitle="Globally trending dishes that fit your existing pantry"
        />

        <Reveal delay={80}>
          <NoveltyStatsRow
            total={novelty.length}
            zeroFriction={zeroFriction.length}
            avgPantryMatch={avgPantryMatch}
            top={top}
          />
        </Reveal>

        <div className="grid grid-cols-3 gap-6">
          {top && (
            <Reveal delay={220} className="col-span-2">
              <NoveltyHero dish={top} />
            </Reveal>
          )}
          <div className="col-span-1 grid grid-rows-2 gap-6">
            <Reveal delay={300}>
              <ZeroFrictionCard count={zeroFriction.length} example={zeroFriction[0]} />
            </Reveal>
            <Reveal delay={360}>
              <GlobalInsightsCard
                total={novelty.length}
                avgPantryMatch={avgPantryMatch}
                avgScore={avgNoveltyScore}
              />
            </Reveal>
          </div>
        </div>

        <Reveal delay={420}>
          <NoveltyList items={novelty} />
        </Reveal>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI stats row
// ─────────────────────────────────────────────────────────────────────────────

function NoveltyStatsRow({
  total,
  zeroFriction,
  avgPantryMatch,
  top,
}: {
  total: number;
  zeroFriction: number;
  avgPantryMatch: number;
  top?: NoveltyItem;
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard
        accent="violet"
        icon={<Layers className="w-5 h-5" />}
        label="Candidates"
        value={total}
        delay={100}
        caption="global dishes considered"
      />
      <KpiCard
        accent="emerald"
        icon={<CheckCircle2 className="w-5 h-5" />}
        label="Zero-friction"
        value={zeroFriction}
        delay={180}
        caption="100% pantry match"
      />
      <KpiCard
        accent="amber"
        icon={<Globe className="w-5 h-5" />}
        label="Avg pantry match"
        value={total ? avgPantryMatch : 0}
        empty={!total}
        format={(v) => `${Math.round(v)}%`}
        delay={260}
        caption="across all candidates"
      />
      <KpiCard
        accent="rose"
        icon={<Sparkles className="w-5 h-5" />}
        label="Top novelty"
        value={top ? Math.round(top.noveltyScore * 100) : 0}
        empty={!top}
        delay={340}
        caption={top ? top.name : "no data"}
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

function NoveltyHero({ dish }: { dish: NoveltyItem }) {
  const score = Math.round(dish.noveltyScore * 100);
  const matchPct = Math.round(dish.overlapRatio * 100);
  const isZeroFriction = dish.missingIngredients.length === 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 text-white p-8 h-full glow-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-[#082f49] via-[#1e1b4b] to-[#4c1d95]" />
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-60 blur-3xl blob-float"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.55), transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-12 w-96 h-96 rounded-full opacity-50 blur-3xl blob-float"
        style={{
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.5), transparent 65%)",
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
              <Sparkles className="w-4 h-4" />
            </div>
            <span
              className="text-[11px] uppercase tracking-[0.2em] opacity-90"
              style={{ fontWeight: 700 }}
            >
              Top recommendation
            </span>
          </div>
          <div>
            <h2
              className="text-6xl leading-[1.0] mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-violet-200"
              style={{ fontWeight: 800 }}
            >
              {dish.name}
            </h2>
            <p className="text-base opacity-80 max-w-xl">
              {isZeroFriction
                ? "Zero-friction add — your pantry already covers every ingredient."
                : `Only ${dish.missingIngredients.length} ingredient${
                    dish.missingIngredients.length > 1 ? "s" : ""
                  } away from launching this dish.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <HeroStat value={score} unit="/ 100" label="Novelty Score" delay={500} />
          <HeroStat value={matchPct} format={(v) => `${Math.round(v)}%`} label="Pantry Match" delay={620} />
          <HeroStat
            value={isZeroFriction ? 0 : dish.missingIngredients.length}
            label="Missing items"
            delay={740}
          />
        </div>

        <button
          type="button"
          className="group self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/95 text-violet-900 text-sm hover:bg-white transition-all shadow-lg shadow-black/20 hover:scale-[1.02]"
          style={{ fontWeight: 700 }}
        >
          Plan this dish
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
  format,
  delay = 0,
}: {
  value: number;
  unit?: string;
  label: string;
  format?: (v: number) => string;
  delay?: number;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3.5 hover:bg-white/15 transition-colors">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl tracking-tight text-white" style={{ fontWeight: 700 }}>
          <CountUp to={value} format={format} delay={delay} />
        </span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mt-1" style={{ fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact cards
// ─────────────────────────────────────────────────────────────────────────────

function ZeroFrictionCard({ count, example }: { count: number; example?: NoveltyItem }) {
  return (
    <GlassCard interactive className="relative p-5 flex flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 bg-emerald-500"
      />
      <div className="relative flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px] shadow-emerald-500/60" />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Zero-Friction
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/15 border border-emerald-400/25">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
        </div>
      </div>
      <div className="relative flex items-baseline gap-2">
        <span
          className="text-4xl tracking-tight leading-none text-emerald-300"
          style={{ fontWeight: 800 }}
        >
          <CountUp to={count} delay={300} />
        </span>
        <span className="text-sm text-muted-foreground">ready to launch</span>
      </div>
      <div className="relative text-base mt-3" style={{ fontWeight: 600 }}>
        {example ? example.name : "no candidates"}
      </div>
      <div className="relative text-sm mt-1 text-muted-foreground">
        {example ? "100% pantry covered" : "needs more menu data"}
      </div>
    </GlassCard>
  );
}

function GlobalInsightsCard({
  total,
  avgPantryMatch,
  avgScore,
}: {
  total: number;
  avgPantryMatch: number;
  avgScore: number;
}) {
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
          Global Insights
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/15 border border-violet-400/25">
          <Globe className="w-5 h-5 text-violet-300" />
        </div>
      </div>
      <div className="relative flex items-baseline gap-2">
        <span
          className="text-4xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-violet-200 to-fuchsia-300"
          style={{ fontWeight: 800 }}
        >
          <CountUp to={total} delay={300} />
        </span>
        <span className="text-sm text-muted-foreground">candidates</span>
      </div>
      <div className="relative text-sm mt-3 text-muted-foreground">
        {avgPantryMatch}% avg pantry · {avgScore}/100 avg novelty
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Self-contained list
// ─────────────────────────────────────────────────────────────────────────────

type NoveltySortKey = "name" | "novelty" | "pantry";

function NoveltyList({ items }: { items: NoveltyItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<NoveltySortKey>("novelty");
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
        case "pantry":
          av = a.overlapRatio;
          bv = b.overlapRatio;
          break;
        case "novelty":
        default:
          av = a.noveltyScore;
          bv = b.noveltyScore;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [items, searchQuery, sortKey, sortDir]);

  const onSort = (key: NoveltySortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };
  const dirFor = (key: NoveltySortKey) => (sortKey === key ? sortDir : null);

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-300" />
            Recommended Additions
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
                direction={dirFor("pantry")}
                onClick={() => onSort("pantry")}
              >
                Pantry Match
              </SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={{ fontWeight: 600 }}>
                Missing
              </span>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader
                align="center"
                direction={dirFor("novelty")}
                onClick={() => onSort("novelty")}
              >
                Novelty
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
            visibleItems.map((dish, index) => {
              const matchPct = Math.round(dish.overlapRatio * 100);
              const isZeroFriction = dish.missingIngredients.length === 0;
              return (
                <TableRow key={dish.name} className="border-border hover:bg-white/[0.03]">
                  <TableCell
                    className="pl-6 text-sm text-muted-foreground"
                    style={{ fontWeight: 600 }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DishCell name={dish.name} subtitle="Global" />
                      {isZeroFriction && (
                        <Pill tone="positive">
                          <CheckCircle2 className="w-3 h-3" />
                          Zero-friction
                        </Pill>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm" style={{ fontWeight: 600 }}>
                    {matchPct}%
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {isZeroFriction ? (
                      <span className="text-emerald-300">None</span>
                    ) : (
                      dish.missingIngredients.join(", ")
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-violet-300" style={{ fontWeight: 700 }}>
                      {Math.round(dish.noveltyScore * 100)}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <ActionPill tone="primary">
                      Plan
                      <ArrowUpRight className="w-3 h-3" />
                    </ActionPill>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </GlassCard>
  );
}
