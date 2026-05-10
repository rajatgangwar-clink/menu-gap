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

          <DashboardStatsRow data={data} />

          <div className="grid grid-cols-3 gap-6">
            {topMustHave && (
              <div className="col-span-2">
                <MustHaveHero item={topMustHave} />
              </div>
            )}
            <div className="col-span-1 grid grid-rows-2 gap-6">
              {topPerformer && <CompactPerformerCard item={topPerformer} variant="top" />}
              {worstPerformer && <CompactPerformerCard item={worstPerformer} variant="worst" />}
            </div>
          </div>


          <div className="grid grid-cols-2 gap-6">
            <PricingDistributionGauge data={data} />
            <PricingStatusList data={data} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <PerformerList
              title="Top Performing Dishes"
              items={data.bestPerformers}
              tone="positive"
            />
            <PerformerList
              title="Worst Performing Dishes"
              items={data.worstPerformers}
              tone="negative"
            />
          </div>
        </div>
      </div>

      <aside className="w-80 bg-card border-l border-border overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3>AI Suggestions</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Recommendations based on your data
          </p>
        </div>
        <div className="p-6 space-y-3">
          {aiSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <h4 className="text-sm">{suggestion.title}</h4>
                <Pill tone={suggestion.impact === "High" ? "primary" : "caution"}>
                  {suggestion.impact}
                </Pill>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function MustHaveHero({ item }: { item: MustHaveItem }) {
  const matchScore = Math.round(item.mustHaveScore * 100);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-400 text-white p-8 h-full">
      <DecorBlobs />
      <div className="relative flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs uppercase tracking-[0.15em] opacity-90" style={{ fontWeight: 600 }}>
              Biggest opportunity
            </span>
          </div>
          <div>
            <h2 className="text-5xl leading-[1.05] mb-3 tracking-tight" style={{ fontWeight: 700 }}>
              {item.name}
            </h2>
            <p className="text-base opacity-90 max-w-xl">
              {`${item.competitorCount} ${
                item.competitorCount === 1 ? "competitor" : "competitors"
              } serve this with strong reviews. You don't — adding it could close a real gap.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <HeroStat
            value={item.avgRating.toFixed(1)}
            unit="/ 5"
            label="Avg Rating"
            tone="warm"
          />
          <HeroStat
            value={formatCompactNumber(item.totalReviews)}
            label={item.totalReviews === 1 ? "Review" : "Reviews"}
          />
          <HeroStat
            value={String(item.competitorCount)}
            label={item.competitorCount === 1 ? "Cafe Serves It" : "Cafes Serve It"}
          />
          <HeroStat value={String(matchScore)} unit="/ 100" label="Must-Have Score" tone="bright" />
        </div>

        <button
          type="button"
          className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
          style={{ fontWeight: 600 }}
        >
          Analyze this dish
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
  tone = "default",
}: {
  value: string;
  unit?: string;
  label: string;
  tone?: "default" | "warm" | "bright";
}) {
  const accent =
    tone === "warm"
      ? "text-amber-200"
      : tone === "bright"
        ? "text-white"
        : "text-white";
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3.5">
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl tracking-tight ${accent}`} style={{ fontWeight: 700 }}>
          {value}
        </span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
      <div className="text-[11px] uppercase tracking-wider opacity-80 mt-1" style={{ fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function formatCompactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

function DecorBlobs() {
  return (
    <>
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-black/10 blur-3xl" />
    </>
  );
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
  return (
    <div className="bg-card rounded-2xl p-5 border border-border flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-2 h-2 rounded-full ${isTop ? "bg-emerald-500" : "bg-rose-500"}`}
        />
        <span
          className="text-xs uppercase tracking-wider text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {isTop ? "Top Performer" : "Needs Attention"}
        </span>
        <div
          className={`ml-auto w-9 h-9 rounded-xl flex items-center justify-center ${
            isTop ? "bg-emerald-50" : "bg-rose-50"
          }`}
        >
          {isTop ? (
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-rose-600" />
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className={`text-3xl tracking-tight leading-none ${
            isTop ? "text-emerald-600" : "text-rose-600"
          }`}
          style={{ fontWeight: 700 }}
        >
          {score}
        </span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>

      <div
        className="text-base mt-2 truncate"
        style={{ fontWeight: 600 }}
      >
        {item.name}
      </div>

      <div className="text-sm mt-2 flex items-center gap-1.5">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span style={{ fontWeight: 700 }}>{item.rating.toFixed(1)}</span>
        <span className="text-muted-foreground opacity-50">·</span>
        <span className="text-muted-foreground">
          {item.reviewCount.toLocaleString()} {item.reviewCount === 1 ? "review" : "reviews"}
        </span>
      </div>
    </div>
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
      // Names default to asc; numeric defaults to desc.
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const dirFor = (key: PerformerSortKey) => (sortKey === key ? sortDir : null);

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
              <span className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontWeight: 600 }}>
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
              <TableRow key={dish.menuItemId} className="border-border">
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
                      positive ? "text-emerald-600" : "text-rose-600"
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
    </div>
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
        dotColor="bg-indigo-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
        }
        label="Menu items"
        value={menuItems.toString()}
        caption={
          data.dishRankings.length
            ? `${fairCount} fairly priced`
            : "no priced items"
        }
      />
      <KpiCard
        dotColor="bg-amber-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
        }
        label="Avg rating"
        value={performers.length ? avgRating.toFixed(1) : "—"}
        caption={
          performers.length
            ? `from ${totalReviews.toLocaleString()} reviews`
            : "no reviews yet"
        }
      />
      <KpiCard
        dotColor="bg-emerald-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
        }
        label="Must-haves"
        value={mustHavesCount.toString()}
        caption={topMustHave ? `Top: ${topMustHave.name}` : "no opportunities"}
      />
      <KpiCard
        dotColor="bg-rose-500"
        icon={
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
        }
        label="Pricing alerts"
        value={overpricedCount.toString()}
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
        <span className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontWeight: 600 }}>
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

