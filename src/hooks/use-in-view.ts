"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** IntersectionObserver root margin — extends the viewport when computing intersection. Default "0px 0px -10% 0px" so cards fire slightly before fully on-screen. */
  rootMargin?: string;
  /** Intersection threshold (0..1). Default 0.05 — fires when ~5% of the element is visible. */
  threshold?: number;
  /** When true, the hook latches to `true` on first intersection and never flips back, so the animation only plays once. Defaults to true since we use this for entrance animations. */
  once?: boolean;
}

// Lightweight wrapper around IntersectionObserver. Returns a ref callback +
// a boolean so callers can do `ref={ref}` then read `inView` to gate
// animations. SSR-safe: returns `false` until mount.
export function useInView<T extends Element>(options: Options = {}) {
  const { rootMargin = "0px 0px -10% 0px", threshold = 0.05, once = true } = options;

  const elementRef = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Older browsers without IntersectionObserver — just consider it visible
    // immediately rather than block the animation forever.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref: elementRef, inView };
}
