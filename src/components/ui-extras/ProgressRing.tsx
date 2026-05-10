"use client";

import { useEffect, useId, useState } from "react";

interface ProgressRingProps {
  /** 0–100 (will be clamped). */
  value: number;
  /** Outer diameter in px. */
  size?: number;
  /** Stroke thickness. */
  stroke?: number;
  /** Two-stop gradient for the active arc. */
  from?: string;
  to?: string;
  /** Glow filter color (defaults to `from`). */
  glow?: string;
  /** Animation start delay in ms. */
  delay?: number;
  /** Optional content centered inside the ring (e.g. value + label). */
  children?: React.ReactNode;
  className?: string;
}

// Single-arc radial progress ring with a gradient stroke and a soft glow.
// Animates the arc length via stroke-dashoffset on mount. Use as a drop-in
// replacement for flat progress bars on score-style KPIs.
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  from = "#a78bfa",
  to = "#ec4899",
  glow,
  delay = 80,
  children,
  className = "",
}: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  const id = useId();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - safeValue / 100);

  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    const t = window.setTimeout(() => setOffset(target), delay);
    return () => window.clearTimeout(t);
  }, [target, delay]);

  const glowColor = glow ?? from;
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Glow halo — same arc rendered behind, blurred */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={glowColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#${id}-glow)`}
          opacity={0.6}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        {/* Active arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id}-grad)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
