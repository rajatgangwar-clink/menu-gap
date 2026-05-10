"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { LegendStat } from "./LegendStat";
import type { DashboardData } from "@/lib/types";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { CountUp } from "@/components/ui-extras/CountUp";

export function MenuCoverageDonut({ data }: { data: DashboardData }) {
  const total = data.trending.length;
  const served = data.trending.filter((t) => t.servedByCafe).length;
  const gaps = total - served;
  const pct = total === 0 ? 0 : Math.round((served / total) * 100);

  const chartData =
    total === 0
      ? [{ name: "empty", value: 1 }]
      : [
          { name: "Served", value: served },
          { name: "Gap", value: gaps },
        ];
  // Bright violet "served" arc against a muted track on dark glass.
  const colors = total === 0 ? ["rgba(255,255,255,0.06)"] : ["#a78bfa", "rgba(255,255,255,0.08)"];

  return (
    <GlassCard className="p-6 flex flex-col h-full">
      <div className="mb-2">
        <h3>Menu Coverage</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Trending dishes you already serve
        </p>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-violet-200 to-fuchsia-300"
            style={{ fontWeight: 800 }}
          >
            <CountUp to={pct} format={(v) => `${Math.round(v)}%`} />
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] mt-1" style={{ fontWeight: 600 }}>
            Coverage
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border mt-2">
        <LegendStat dotColor="bg-violet-400 shadow-[0_0_10px] shadow-violet-400/60" label="On menu" value={served.toString()} />
        <LegendStat dotColor="bg-white/20" label="Gap" value={gaps.toString()} />
      </div>
    </GlassCard>
  );
}
