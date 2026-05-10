"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { LegendStat } from "./LegendStat";
import type { DashboardData } from "@/lib/types";

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
  const colors = total === 0 ? ["#e5e7eb"] : ["#4f46e5", "#e5e7eb"];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex flex-col h-full">
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
          <div className="text-4xl tracking-tight" style={{ fontWeight: 700 }}>
            {pct}%
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            Coverage
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border mt-2">
        <LegendStat dotColor="bg-indigo-500" label="On menu" value={served.toString()} />
        <LegendStat dotColor="bg-gray-300" label="Gap" value={gaps.toString()} />
      </div>
    </div>
  );
}
