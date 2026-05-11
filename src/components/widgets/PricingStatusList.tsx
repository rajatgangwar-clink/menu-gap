"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Filter, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardData, PriceLabel } from "@/lib/types";
import { GlassCard } from "@/components/ui-extras/GlassCard";

type StatusFilter = "all" | PriceLabel;

const FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "underpriced", label: "Underpriced" },
  { key: "fair", label: "Fair" },
  { key: "overpriced", label: "Overpriced" },
];

export function PricingStatusList({ data }: { data: DashboardData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.dishRankings.filter((r) => {
      if (statusFilter !== "all" && r.label !== statusFilter) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.dishRankings, searchQuery, statusFilter]);

  const activeFilter = FILTER_OPTIONS.find((o) => o.key === statusFilter)!;

  return (
    <GlassCard className="overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3>Pricing Status</h3>
            <p className="text-xs text-muted-foreground mt-1">Top items vs market average</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#B08968]/40 focus:border-[#B08968] text-sm transition-colors"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 border border-[#E7DED2] bg-[#FCF8F3] rounded-lg hover:bg-[#F4ECE3] transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>{activeFilter.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setFilterOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full mt-1 w-44 glass-strong rounded-lg border border-[#E7DED2] z-50 py-1">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.key);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#F4ECE3] transition-colors flex items-center justify-between ${
                        statusFilter === opt.key ? "text-[#B08968]" : "text-foreground"
                      }`}
                      style={{ fontWeight: statusFilter === opt.key ? 600 : 500 }}
                    >
                      {opt.label}
                      {statusFilter === opt.key && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B08968]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
      <Table className="table-fixed">
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
              <span
                className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Dish
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[88px]">
              <span
                className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                My Price
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-right w-[100px]">
              <span
                className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Market
              </span>
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-popover text-center pr-6 w-[140px]">
              <span
                className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Status
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                No matching items.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((r, index) => (
              <TableRow key={r.menuItemId} className="border-border">
                <TableCell
                  className="pl-6 text-sm text-muted-foreground"
                  style={{ fontWeight: 600 }}
                >
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="text-sm truncate" style={{ fontWeight: 600 }}>
                    {r.name}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums" style={{ fontWeight: 600 }}>
                  ₹{r.price.toFixed(0)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  ₹{r.avgGroupPrice.toFixed(0)}
                </TableCell>
                <TableCell className="text-center pr-6">
                  <StatusBadge label={r.label} />
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

// Status badges on dark glass — translucent tints with a subtle inner glow
// so the colors read as labels, not solid buttons.
function StatusBadge({ label }: { label: PriceLabel }) {
  const map = {
    underpriced: {
      bg: "bg-[#EDF5F0]",
      border: "border-[#CFE4D7]",
      dot: "bg-[#5F8D73]",
      text: "text-[#5F8D73]",
      label: "Underpriced",
    },
    fair: {
      bg: "bg-[#FBF1E1]",
      border: "border-[#EBD9B6]",
      dot: "bg-[#C38B59]",
      text: "text-[#C38B59]",
      label: "Fair",
    },
    overpriced: {
      bg: "bg-[#F8ECE8]",
      border: "border-[#EBCEC4]",
      dot: "bg-[#D57A66]",
      text: "text-[#D57A66]",
      label: "Overpriced",
    },
  } as const;
  const cfg = map[label];
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
