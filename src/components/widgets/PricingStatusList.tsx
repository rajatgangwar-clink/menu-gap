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
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-full">
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
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-accent/50 transition-colors text-sm"
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
                <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-lg shadow-lg border border-border z-50 py-1">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.key);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex items-center justify-between ${
                        statusFilter === opt.key ? "text-primary" : "text-foreground"
                      }`}
                      style={{ fontWeight: statusFilter === opt.key ? 600 : 500 }}
                    >
                      {opt.label}
                      {statusFilter === opt.key && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
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
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 sticky top-0 z-10">
            <TableHead className="pl-6">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Dish
              </span>
            </TableHead>
            <TableHead className="text-center">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Price
              </span>
            </TableHead>
            <TableHead className="text-center">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Market
              </span>
            </TableHead>
            <TableHead className="text-center pr-6">
              <span
                className="text-xs uppercase tracking-wider text-muted-foreground"
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
              <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                No matching items.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.menuItemId} className="border-border">
                <TableCell className="pl-6">
                  <div className="text-sm truncate" style={{ fontWeight: 600 }}>
                    {r.name}
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm" style={{ fontWeight: 600 }}>
                  ₹{r.price.toFixed(0)}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
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
    </div>
  );
}

function StatusBadge({ label }: { label: PriceLabel }) {
  const map = {
    underpriced: { bg: "bg-emerald-600", label: "Underpriced" },
    fair: { bg: "bg-amber-500", label: "Fair" },
    overpriced: { bg: "bg-rose-600", label: "Overpriced" },
  } as const;
  const cfg = map[label];
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs text-white min-w-[108px] ${cfg.bg}`}
      style={{ fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
      {cfg.label}
    </span>
  );
}
