"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Flame,
  MessageSquare,
  Sparkles,
  Star,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type Tone = "primary" | "positive" | "caution" | "negative" | "neutral" | "invert";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  positive: "bg-status-positive text-status-positive-foreground",
  caution: "bg-status-caution text-status-caution-foreground",
  negative: "bg-status-negative text-status-negative-foreground",
  neutral: "bg-muted text-muted-foreground",
  // For use on dark/gradient surfaces — translucent white with light text.
  invert: "bg-white/20 text-white backdrop-blur-sm",
};

interface PillProps {
  tone?: Tone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function Pill({ tone = "neutral", icon: Icon, children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${toneClasses[tone]} ${className}`}
      style={{ fontWeight: 600 }}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span className="leading-none">{children}</span>
    </span>
  );
}

export function RatingPill({
  rating,
  tone = "caution",
  className,
}: {
  rating: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Pill tone={tone} className={className}>
      <Star className="w-3.5 h-3.5 fill-current" />
      {rating.toFixed(1)}
    </Pill>
  );
}

export function ReviewPill({
  count,
  tone = "neutral",
  className,
}: {
  count: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Pill tone={tone} icon={MessageSquare} className={className}>
      {count.toLocaleString()}
    </Pill>
  );
}

export function CompetitorPill({
  count,
  tone = "primary",
  className,
}: {
  count: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Pill tone={tone} icon={Store} className={className}>
      {count} {count === 1 ? "cafe" : "cafes"}
    </Pill>
  );
}

export function ScorePill({
  score,
  tone = "primary",
  label = "score",
  className,
}: {
  /** Either 0–1 or 0–100. Auto-detected. */
  score: number;
  tone?: Tone;
  label?: string;
  className?: string;
}) {
  const value = score <= 1 ? Math.round(score * 100) : Math.round(score);
  return (
    <Pill tone={tone} icon={Sparkles} className={className}>
      {value}/100 {label}
    </Pill>
  );
}

export function TrendDeltaPill({
  delta,
  className,
}: {
  /** signed delta like "+12" or "-22"; prefix is preserved */
  delta: string;
  className?: string;
}) {
  const isPositive = delta.trim().startsWith("+");
  const isNegative = delta.trim().startsWith("-");
  const tone: Tone = isPositive ? "positive" : isNegative ? "negative" : "neutral";
  const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null;
  return (
    <Pill tone={tone} className={className}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {delta}
    </Pill>
  );
}

export function HotPill({ children = "Hot", className }: { children?: ReactNode; className?: string }) {
  return (
    <Pill tone="negative" icon={Flame} className={className}>
      {children}
    </Pill>
  );
}
