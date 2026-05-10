"use client";

import type { CSSProperties, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** When true, the card lifts and gets a violet glow on hover. */
  interactive?: boolean;
  /** When true, the card uses the heavier (more opaque) glass variant — better for dense data surfaces like tables. */
  strong?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

// A single source of truth for the dark frosted-glass surface used across the
// app. Cards keep their rounded radius and inner glow consistent regardless
// of where they're placed over the aurora.
export function GlassCard({
  children,
  className = "",
  interactive = false,
  strong = false,
  style,
  onClick,
}: GlassCardProps) {
  const base = strong ? "glass-strong" : "glass";
  const hover = interactive ? "hover-lift cursor-pointer" : "";
  return (
    <div
      onClick={onClick}
      className={`${base} ${hover} rounded-2xl ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
