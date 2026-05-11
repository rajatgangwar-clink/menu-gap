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
import { useRouter } from "next/navigation";
import { noveltyPlanPrompt } from "@/lib/prompts";
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
  // The hero already showcases the top "Ready to Add" pick. The side card
  // instead surfaces the best opportunity that needs ingredients — a
  // different angle than the hero so the two cards don't echo each other.
  const ingredientGap = useMemo(
    () => novelty.find((n) => n.missingIngredients.length > 0),
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
  const needsIngredientsCount = novelty.length - zeroFriction.length;

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
              <IngredientGapCard
                count={needsIngredientsCount}
                example={ingredientGap}
              />
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

function NoveltyHero({ dish }: { dish: NoveltyItem }) {
  const router = useRouter();
  const score = Math.round(dish.noveltyScore * 100);
  const matchPct = Math.round(dish.overlapRatio * 100);
  const isZeroFriction = dish.missingIngredients.length === 0;

  const handlePlan = () => {
    const prompt = noveltyPlanPrompt(dish);
    router.push(`/ai-assistance?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#7F5539] text-white p-8 h-full">

      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <span
              className="text-[11px] uppercase tracking-[0.2em] opacity-90"
              style={{ fontWeight: 700 }}
            >
              Top recommendation
            </span>
            <span
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] uppercase tracking-wider"
              style={{ fontWeight: 700 }}
            >
              {dish.readinessLabel}
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
          onClick={handlePlan}
          className="group self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFF8F2] text-[#7F5539] text-sm hover:bg-white transition-all shadow-lg shadow-black/20 hover:scale-[1.02]"
          style={{ fontWeight: 700 }}
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
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3.5 hover:bg-white/15 transition-colors">
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

function IngredientGapCard({
  count,
  example,
}: {
  count: number;
  example?: NoveltyItem;
}) {
  const missingCount = example?.missingIngredients.length ?? 0;
  const preview = example?.missingIngredients.slice(0, 3).join(", ") ?? "";
  const moreCount = (example?.missingIngredients.length ?? 0) - 3;
  return (
    <GlassCard interactive className="relative p-5 flex flex-col overflow-hidden">
      <div className="relative flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#C38B59]" />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Ingredient Gap
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-[#FBF1E1] border border-[#EBD9B6]">
          <Layers className="w-5 h-5 text-[#C38B59]" />
        </div>
      </div>
      <div className="relative flex items-baseline gap-2">
        <span
          className="text-4xl tracking-tight leading-none text-[#C38B59]"
          style={{ fontWeight: 800 }}
        >
          <CountUp to={count} delay={300} />
        </span>
        <span className="text-sm text-muted-foreground">
          {count === 1 ? "needs stocking" : "need stocking"}
        </span>
      </div>
      <div className="relative text-base mt-3 truncate" style={{ fontWeight: 600 }}>
        {example ? example.name : "no candidates"}
      </div>
      <div className="relative text-sm mt-1 text-muted-foreground truncate">
        {example
          ? `${missingCount} missing: ${preview}${moreCount > 0 ? ` +${moreCount}` : ""}`
          : "all candidates are ready to add"}
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
      <div className="relative flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#B08968]" />
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Global Insights
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-[#F4ECE3] border border-[#E7DED2]">
          <Globe className="w-5 h-5 text-[#B08968]" />
        </div>
      </div>
      <div className="relative flex items-baseline gap-2">
        <span
          className="text-4xl tracking-tight leading-none text-[#B08968]"
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<NoveltySortKey>("novelty");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handlePlan = (dish: NoveltyItem) => {
    const prompt = noveltyPlanPrompt(dish);
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
            <Sparkles className="w-4 h-4 text-[#B08968]" />
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
            <TableHead className="sticky top-0 z-10 bg-popover w-[28%]">
              <SortHeader direction={dirFor("name")} onClick={() => onSort("name")}>
                Dish
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[110px]">
              <SortHeader
                align="right"
                direction={dirFor("pantry")}
                onClick={() => onSort("pantry")}
              >
                Pantry Match
              </SortHeader>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Missing
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center w-[140px]">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Readiness
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center pr-6 w-[110px]">
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
              const matchPct = Math.round(dish.overlapRatio * 100);
              const isZeroFriction = dish.missingIngredients.length === 0;
              return (
                <TableRow key={dish.name} className="border-border hover:bg-[#FCF8F3]">
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
                  <TableCell className="text-right text-sm tabular-nums" style={{ fontWeight: 600 }}>
                    {matchPct}%
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-normal">
                    {isZeroFriction ? (
                      <span className="text-[#5F8D73]">None</span>
                    ) : (
                      <span className="line-clamp-1">{dish.missingIngredients.join(", ")}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <ReadinessBadge label={dish.readinessLabel} />
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
    </GlassCard>
  );
}

function ReadinessBadge({ label }: { label: string }) {
  const tone =
    label === "Ready to Add"
      ? "bg-[#5F8D73] text-white"
      : "bg-[#C38B59]/90 text-white";
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs min-w-[110px] ${tone}`}
      style={{ fontWeight: 600 }}
    >
      {label}
    </span>
  );
}
