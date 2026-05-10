"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { DashboardData, PriceLabel } from "@/lib/types";

interface SegmentConfig {
  key: PriceLabel;
  label: string;
  description: string;
  fill: string;
  chipBg: string;
  chipBorder: string;
  text: string;
}

const SEGMENTS: SegmentConfig[] = [
  {
    key: "underpriced",
    label: "Underpriced",
    description: "Room to raise",
    fill: "#10b981",
    chipBg: "bg-emerald-50",
    chipBorder: "border-emerald-200",
    text: "text-emerald-700",
  },
  {
    key: "fair",
    label: "Fair",
    description: "Market-aligned",
    fill: "#f59e0b",
    chipBg: "bg-amber-50",
    chipBorder: "border-amber-200",
    text: "text-amber-700",
  },
  {
    key: "overpriced",
    label: "Overpriced",
    description: "Above market",
    fill: "#ef4444",
    chipBg: "bg-rose-50",
    chipBorder: "border-rose-200",
    text: "text-rose-700",
  },
];

export function PricingDistributionGauge({ data }: { data: DashboardData }) {
  const counts: Record<PriceLabel, number> = { underpriced: 0, fair: 0, overpriced: 0 };
  for (const r of data.dishRankings) counts[r.label] += 1;
  const total = counts.underpriced + counts.fair + counts.overpriced;

  const chartData =
    total === 0
      ? [{ name: "empty", value: 1 }]
      : SEGMENTS.map((s) => ({ name: s.label, value: counts[s.key] }));
  const colors = total === 0 ? ["#e5e7eb"] : SEGMENTS.map((s) => s.fill);

  return (
    <div className="bg-card rounded-2xl border border-border px-6 pt-5 pb-5 flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div>
          <h3>Pricing Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            How your menu is positioned vs. market
          </p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {total} {total === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="relative -mt-2 flex justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart margin={{ top: 40, right: 60, bottom: 0, left: 60 }}>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="100%"
              innerRadius={80}
              outerRadius={115}
              startAngle={180}
              endAngle={0}
              stroke="none"
              paddingAngle={total > 1 ? 2 : 0}
              label={total > 0 ? renderCalloutLabel(total) : false}
              labelLine={
                total > 0
                  ? { stroke: "#cbd5e1", strokeWidth: 1 }
                  : false
              }
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center pointer-events-none">
          <div className="text-4xl tracking-tight" style={{ fontWeight: 700 }}>
            {total}
          </div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
            priced items
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        {SEGMENTS.map((s) => (
          <SegmentChip key={s.key} config={s} />
        ))}
      </div>
    </div>
  );
}

// Custom label rendered OUTSIDE each pie segment with a leader line.
// Recharts draws the line for us via `labelLine={true}` on the Pie; this
// renders the label text at the line's terminal position.
interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  value?: number;
  name?: string;
}

function renderCalloutLabel(total: number) {
  return function LabelComponent(raw: PieLabelProps) {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, value = 0, name = "" } = raw;
    if (!value) return null;
    const segment = SEGMENTS.find((s) => s.label === name);
    if (!segment) return null;

    const RADIAN = Math.PI / 180;
    const labelRadius = outerRadius + 22;
    const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
    const pct = Math.round((value / total) * 100);

    // Anchor based on which side of the donut the label lands on.
    const textAnchor = x > cx + 6 ? "start" : x < cx - 6 ? "end" : "middle";

    return (
      <g>
        <text
          x={x}
          y={y - 6}
          fill={segment.fill}
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}
        >
          {value}
        </text>
        <text
          x={x}
          y={y + 14}
          fill="#6b7280"
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          {pct}%
        </text>
      </g>
    );
  };
}

function SegmentChip({ config }: { config: SegmentConfig }) {
  return (
    <div
      className={`rounded-xl border ${config.chipBorder} ${config.chipBg} px-4 py-3 flex flex-col gap-1`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.fill }}
        />
        <span className={`text-sm truncate ${config.text}`} style={{ fontWeight: 600 }}>
          {config.label}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">{config.description}</div>
    </div>
  );
}
