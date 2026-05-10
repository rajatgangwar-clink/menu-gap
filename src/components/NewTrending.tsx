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

        <TrendingStatsRow
          total={totalTrending}
          served={servedCount}
          coverage={coverage}
          avgScore={avgScore}
          topRising={topRising}
        />

        <div className="grid grid-cols-3 gap-6">
          {topRising && (
            <div className="col-span-2">
              <TrendingHero dish={topRising} />
            </div>
          )}
          <div className="col-span-1 grid grid-rows-2 gap-6">
            {topDeclining && <CompactTrendCard dish={topDeclining} variant="cooling" />}
            <CompactTrendCard
              variant="hottest"
              dish={topRising}
              servedCount={servedCount}
              total={totalTrending}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 items-start">
          <div className="col-span-2">
            <TrendingList title="Rising in Your Area" items={rising} tone="positive" />
          </div>
          <div className="col-span-1">
            <MenuCoverageDonut data={data} />
          </div>
        </div>

        <TrendingList title="Cooling Off" items={declining} tone="negative" fullWidth />
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
        dotColor="bg-indigo-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
        }
        label="Tracked"
        value={total.toString()}
        caption="trending dishes locally"
      />
      <KpiCard
        dotColor="bg-emerald-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        }
        label="Coverage"
        value={`${coverage}%`}
        caption={`${served} of ${total} on your menu`}
      />
      <KpiCard
        dotColor="bg-amber-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
        }
        label="Avg trend score"
        value={total ? avgScore.toString() : "—"}
        caption="across tracked dishes"
      />
      <KpiCard
        dotColor="bg-rose-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <Flame className="w-5 h-5 text-rose-600" />
          </div>
        }
        label="Hottest dish"
        value={topRising ? Math.round(topRising.trendScore * 100).toString() : "—"}
        caption={topRising ? topRising.name : "no data"}
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

function TrendingHero({ dish }: { dish: TrendingItem }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-400 text-white p-8 h-full">
      <DecorBlobs />
      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15">
              <Flame className="w-4 h-4" />
            </div>
            <span
              className="text-xs uppercase tracking-[0.15em] opacity-90"
              style={{ fontWeight: 600 }}
            >
              Hottest right now
            </span>
          </div>
          <div>
            <h2 className="text-5xl leading-[1.05] mb-3 tracking-tight" style={{ fontWeight: 700 }}>
              {dish.name}
            </h2>
            <p className="text-base opacity-90 max-w-xl">
              {dish.servedByCafe
                ? "You already serve this — keep riding the wave."
                : "Highest-momentum dish in your area, missing from your menu."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <HeroStat
            value={Math.round(dish.trendScore * 100).toString()}
            unit="/ 100"
            label="Trend Score"
          />
          <HeroStat value={capitalize(dish.direction)} label="Direction" />
          <HeroStat
            value={dish.servedByCafe ? "Yes" : "No"}
            label={dish.servedByCafe ? "On Your Menu" : "Gap to Close"}
          />
        </div>

        <button
          type="button"
          className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
          style={{ fontWeight: 600 }}
        >
          {dish.servedByCafe ? "View performance" : "Plan addition"}
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
      <div className="bg-card rounded-2xl p-5 border border-border flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span
            className="text-xs uppercase tracking-wider text-muted-foreground"
            style={{ fontWeight: 600 }}
          >
            Cooling Off
          </span>
          <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50">
            <TrendingDown className="w-5 h-5 text-rose-600" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl tracking-tight leading-none text-rose-600"
            style={{ fontWeight: 700 }}
          >
            {score}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <div className="text-base mt-2 truncate" style={{ fontWeight: 600 }}>
          {dish.name}
        </div>
        <div className="text-sm mt-2 text-muted-foreground">{capitalize(dish.direction)}</div>
      </div>
    );
  }

  // hottest summary card
  const coverage = total
    ? Math.round(((servedCount ?? 0) / total) * 100)
    : 0;
  return (
    <div className="bg-card rounded-2xl p-5 border border-border flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        <span
          className="text-xs uppercase tracking-wider text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Market Activity
        </span>
        <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl tracking-tight leading-none text-indigo-600"
          style={{ fontWeight: 700 }}
        >
          {coverage}%
        </span>
      </div>
      <div className="text-base mt-2" style={{ fontWeight: 600 }}>
        Coverage
      </div>
      <div className="text-sm mt-2 text-muted-foreground">
        {servedCount} of {total} trending dishes on your menu
      </div>
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
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            {positive ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
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
            visibleItems.map((dish, index) => (
              <TableRow key={dish.canonicalDishId} className="border-border">
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
                    className={`text-sm ${positive ? "text-emerald-600" : "text-rose-600"}`}
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
    </div>
  );
}

function StatusBadge({ servedByCafe }: { servedByCafe: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs text-white min-w-[88px] ${
        servedByCafe ? "bg-indigo-600" : "bg-slate-500"
      }`}
      style={{ fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
      {servedByCafe ? "On Menu" : "Gap"}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
