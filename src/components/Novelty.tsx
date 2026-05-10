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

        <NoveltyStatsRow
          total={novelty.length}
          zeroFriction={zeroFriction.length}
          avgPantryMatch={avgPantryMatch}
          top={top}
        />

        <div className="grid grid-cols-3 gap-6">
          {top && (
            <div className="col-span-2">
              <NoveltyHero dish={top} />
            </div>
          )}
          <div className="col-span-1 grid grid-rows-2 gap-6">
            <ZeroFrictionCard count={zeroFriction.length} example={zeroFriction[0]} />
            <GlobalInsightsCard
              total={novelty.length}
              avgPantryMatch={avgPantryMatch}
              avgScore={avgNoveltyScore}
            />
          </div>
        </div>

        <NoveltyList items={novelty} />
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
        dotColor="bg-indigo-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
        }
        label="Candidates"
        value={total.toString()}
        caption="global dishes considered"
      />
      <KpiCard
        dotColor="bg-emerald-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        }
        label="Zero-friction"
        value={zeroFriction.toString()}
        caption="100% pantry match"
      />
      <KpiCard
        dotColor="bg-amber-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Globe className="w-5 h-5 text-amber-600" />
          </div>
        }
        label="Avg pantry match"
        value={total ? `${avgPantryMatch}%` : "—"}
        caption="across all candidates"
      />
      <KpiCard
        dotColor="bg-rose-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-rose-600" />
          </div>
        }
        label="Top novelty"
        value={top ? Math.round(top.noveltyScore * 100).toString() : "—"}
        caption={top ? top.name : "no data"}
      />
    </div>
  );
}

function KpiCard({
  dotColor,
  icon,
  label,
  value,
  caption,
}: {
  dotColor: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span
          className="text-xs uppercase tracking-wider text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {label}
        </span>
        <div className="ml-auto">{icon}</div>
      </div>
      <div className="text-3xl tracking-tight" style={{ fontWeight: 700 }}>
        {value}
      </div>
      {caption && (
        <div
          className="text-sm text-muted-foreground mt-1.5 truncate"
          style={{ fontWeight: 500 }}
        >
          {caption}
        </div>
      )}
    </div>
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
    <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-400 text-white p-8 h-full">
      <DecorBlobs />
      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15">
              <Sparkles className="w-4 h-4" />
            </div>
            <span
              className="text-xs uppercase tracking-[0.15em] opacity-90"
              style={{ fontWeight: 600 }}
            >
              Top recommendation
            </span>
          </div>
          <div>
            <h2 className="text-5xl leading-[1.05] mb-3 tracking-tight" style={{ fontWeight: 700 }}>
              {dish.name}
            </h2>
            <p className="text-base opacity-90 max-w-xl">
              {isZeroFriction
                ? "Zero-friction add — your pantry already covers every ingredient."
                : `Only ${dish.missingIngredients.length} ingredient${
                    dish.missingIngredients.length > 1 ? "s" : ""
                  } away from launching this dish.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <HeroStat value={score.toString()} unit="/ 100" label="Novelty Score" />
          <HeroStat value={`${matchPct}%`} label="Pantry Match" />
          <HeroStat
            value={isZeroFriction ? "0" : dish.missingIngredients.length.toString()}
            label={isZeroFriction ? "Missing items" : "Missing items"}
          />
        </div>

        <button
          type="button"
          className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
          style={{ fontWeight: 600 }}
        >
          Plan this dish
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function HeroStat({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3.5">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl tracking-tight text-white" style={{ fontWeight: 700 }}>
          {value}
        </span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
      <div
        className="text-[11px] uppercase tracking-wider opacity-80 mt-1"
        style={{ fontWeight: 600 }}
      >
        {label}
      </div>
    </div>
  );
}

function DecorBlobs() {
  return (
    <>
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-black/10 blur-3xl" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact cards
// ─────────────────────────────────────────────────────────────────────────────

function ZeroFrictionCard({ count, example }: { count: number; example?: NoveltyItem }) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span
          className="text-xs uppercase tracking-wider text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Zero-Friction
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl tracking-tight leading-none text-emerald-600"
          style={{ fontWeight: 700 }}
        >
          {count}
        </span>
        <span className="text-sm text-muted-foreground">ready to launch</span>
      </div>
      <div className="text-base mt-2" style={{ fontWeight: 600 }}>
        {example ? example.name : "no candidates"}
      </div>
      <div className="text-sm mt-1 text-muted-foreground">
        {example ? "100% pantry covered" : "needs more menu data"}
      </div>
    </div>
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
    <div className="bg-card rounded-2xl p-5 border border-border flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        <span
          className="text-xs uppercase tracking-wider text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Global Insights
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50">
          <Globe className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl tracking-tight leading-none text-indigo-600"
          style={{ fontWeight: 700 }}
        >
          {total}
        </span>
        <span className="text-sm text-muted-foreground">candidates</span>
      </div>
      <div className="text-sm mt-2 text-muted-foreground">
        {avgPantryMatch}% avg pantry · {avgScore}/100 avg novelty
      </div>
    </div>
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
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
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
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-12 pl-6">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
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
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
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
                <TableRow key={dish.name} className="border-border">
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
                      <span className="text-emerald-600">None</span>
                    ) : (
                      dish.missingIngredients.join(", ")
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-primary" style={{ fontWeight: 700 }}>
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
    </div>
  );
}
