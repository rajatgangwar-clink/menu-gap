"use client";

export function LegendStat({
  dotColor,
  label,
  value,
}: {
  dotColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <div className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
        {label}
      </div>
      <div className="ml-auto text-sm" style={{ fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}
