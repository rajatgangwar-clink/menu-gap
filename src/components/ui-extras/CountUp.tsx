"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

interface CountUpProps {
  /** Target value to animate to. */
  to: number;
  /** Optional formatter — defaults to integer with locale separators. */
  format?: (value: number) => string;
  /** Animation duration in ms. */
  duration?: number;
  /** Delay before animation starts in ms. Applied after the element is in view. */
  delay?: number;
  /** Decimal places (used by default formatter when provided). */
  decimals?: number;
  className?: string;
}

// Animates a number from 0 to `to` once the element enters the viewport.
// Uses requestAnimationFrame with an ease-out curve so the value flies in
// fast and settles. Cards above the fold animate immediately (observer
// reports intersecting on first observe); cards below the fold wait until
// scroll reveals them.
//
// To avoid a flash of the final value before the observer fires, the
// initial render shows the formatted 0. We also reset and re-run when `to`
// changes (e.g. after data reload), but only if the element is in view.
export function CountUp({
  to,
  format,
  duration = 1100,
  delay = 0,
  decimals = 0,
  className = "",
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const startedAt = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const { ref, inView } = useInView<HTMLSpanElement>();

  useEffect(() => {
    if (!inView) return;

    setValue(0);
    startedAt.current = null;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(to);
      return;
    }

    const startTimer = window.setTimeout(() => {
      const tick = (now: number) => {
        if (startedAt.current == null) startedAt.current = now;
        const elapsed = now - startedAt.current;
        const t = Math.min(1, elapsed / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(to * eased);
        if (t < 1) rafId.current = requestAnimationFrame(tick);
        else setValue(to);
      };
      rafId.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(startTimer);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [to, duration, delay, inView]);

  const formatted = format
    ? format(value)
    : value.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      });

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
