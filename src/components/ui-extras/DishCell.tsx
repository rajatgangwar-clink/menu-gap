"use client";

import type { ReactNode } from "react";

interface DishCellProps {
  name: string;
  subtitle?: ReactNode;
}

export function DishCell({ name, subtitle }: DishCellProps) {
  return (
    <div className="min-w-0">
      <div className="text-sm truncate" style={{ fontWeight: 600 }}>
        {name}
      </div>
      {subtitle && (
        <div className="text-xs text-muted-foreground truncate uppercase tracking-wide mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );
}
