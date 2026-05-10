"use client";

import { ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

type SortDirection = "asc" | "desc" | null;

interface SortHeaderProps {
  children: ReactNode;
  align?: "left" | "right" | "center";
  direction?: SortDirection;
  onClick?: () => void;
}

export function SortHeader({
  children,
  align = "left",
  direction = null,
  onClick,
}: SortHeaderProps) {
  const justify =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 ${justify} w-full text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors`}
      style={{ fontWeight: 600 }}
    >
      {children}
      <Icon className={`w-3 h-3 ${direction ? "text-foreground" : "opacity-50"}`} />
    </button>
  );
}

type Tone = "primary" | "positive" | "negative" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  positive: "bg-emerald-500 text-white hover:bg-emerald-600",
  negative: "bg-rose-500 text-white hover:bg-rose-600",
  neutral: "bg-muted text-foreground hover:bg-muted/80",
};

interface ActionPillProps {
  children: ReactNode;
  tone?: Tone;
  onClick?: () => void;
  className?: string;
}

export function ActionPill({
  children,
  tone = "primary",
  onClick,
  className = "",
}: ActionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full text-xs min-w-[88px] transition-colors ${toneClasses[tone]} ${className}`}
      style={{ fontWeight: 600 }}
    >
      {children}
    </button>
  );
}

export function ChangeIndicator({
  value,
  showSign = true,
}: {
  /** Numeric percent change. */
  value: number;
  showSign?: boolean;
}) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const tone = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-rose-600"
      : "text-muted-foreground";
  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : null;
  const formatted = `${showSign && isPositive ? "+" : ""}${value.toFixed(2)}%`;
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${tone}`} style={{ fontWeight: 600 }}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {formatted}
    </span>
  );
}
