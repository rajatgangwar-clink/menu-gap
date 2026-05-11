"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { DashboardData, PriceLabel } from "@/lib/types";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { CountUp } from "@/components/ui-extras/CountUp";

interface SegmentConfig {
  key: PriceLabel;
  label: string;
  description: string;
  fill: string;
  chipBorder: string;
  chipBg: string;
  text: string;
}

// Segment palette tuned for the dark canvas — fills are bright enough to pop
// against the navy background, chips use translucent tints over the glass.
const SEGMENTS: SegmentConfig[] = [
  {
    key: "underpriced",
    label: "Underpriced",
    description: "Room to raise",
    fill: "#34d399",
    chipBorder: "border-[#CFE4D7]",
    chipBg: "bg-[#EDF5F0]",
    text: "text-[#5F8D73]",
  },
  {
    key: "fair",
    label: "Fair",
    description: "Market-aligned",
    fill: "#fbbf24",
    chipBorder: "border-[#EBD9B6]",
    chipBg: "bg-[#FBF1E1]",
    text: "text-[#C38B59]",
  },
  {
    key: "overpriced",
    label: "Overpriced",
    description: "Above market",
    fill: "#fb7185",
    chipBorder: "border-[#EBCEC4]",
    chipBg: "bg-[#F8ECE8]",
    text: "text-[#D57A66]",
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
  const colors = total === 0 ? ["rgba(255,255,255,0.06)"] : SEGMENTS.map((s) => s.fill);

  return (
    <GlassCard className="px-6 pt-5 pb-5 flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div>
          <h3>Pricing Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            How your menu is positioned vs. market
          </p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full bg-[#F4ECE3] border border-[#E7DED2] text-xs text-muted-foreground"
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
                  ? { stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }
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
          <div className="text-4xl tracking-tight" style={{ fontWeight: 800 }}>
            <CountUp to={total} />
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] mt-0.5" style={{ fontWeight: 600 }}>
            priced items
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        {SEGMENTS.map((s) => (
          <SegmentChip key={s.key} config={s} />
        ))}
      </div>
    </GlassCard>
  );
}

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
          fill="rgba(244, 246, 255, 0.6)"
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
      className={`rounded-xl border ${config.chipBorder} ${config.chipBg} px-4 py-3 flex flex-col gap-1 backdrop-blur-sm transition-colors hover:bg-[#FCF8F3]`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: config.fill,
            boxShadow: `0 0 12px ${config.fill}`,
          }}
        />
        <span className={`text-sm truncate ${config.text}`} style={{ fontWeight: 600 }}>
          {config.label}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">{config.description}</div>
    </div>
  );
}
