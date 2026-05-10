"use client";

import { useEffect, useState } from "react";
import { ParticleField } from "@/components/ui-extras/ParticleField";

// Fixed-position aurora layer that sits behind every page. Three blurred
// gradient blobs drift on long, offset loops, with a faint dot grid + a
// canvas particle field on top. Scroll position from any scrollable
// ancestor in the page is mapped to a small vertical translation so the
// background feels deeper than the foreground.
export function AuroraBackground() {
  const scrollY = useDocumentScrollY();
  // Cap the parallax travel so the blobs don't drift off-screen on long
  // pages. Scaled down by ~0.15 so motion is subtle.
  const parallax = Math.min(120, scrollY * 0.15);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#06070f]" />

      {/* Drifting aurora blobs — each gets a different parallax multiplier
          so they separate slightly on scroll. The transform combines with
          the existing aurora-drift keyframe via the wrapping element. */}
      <div
        className="absolute -top-40 -left-32 w-[680px] h-[680px] rounded-full opacity-60 blur-3xl aurora-drift will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.55), transparent 60%)",
          transform: `translateY(${-parallax * 0.4}px)`,
        }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[720px] h-[720px] rounded-full opacity-50 blur-3xl aurora-drift-2 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(6, 182, 212, 0.45), transparent 60%)",
          transform: `translateY(${-parallax * 0.7}px)`,
        }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[620px] h-[620px] rounded-full opacity-40 blur-3xl aurora-drift will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(219, 39, 119, 0.4), transparent 60%)",
          animationDelay: "-8s",
          transform: `translateY(${-parallax * 1.0}px)`,
        }}
      />

      {/* Dot grid texture — moves the slowest so it stays as a stable
          background plane the eye can anchor to. */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          transform: `translateY(${-parallax * 0.2}px)`,
        }}
      />

      {/* Drifting particle field — sits above the aurora blobs but below the
          edge vignette so the dots fade out toward the corners. */}
      <ParticleField className="absolute inset-0 w-full h-full" density={120} />

      {/* Vignette so edges feel grounded */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(3, 4, 12, 0.65) 100%)",
        }}
      />
    </div>
  );
}

// Aggregate scroll-Y across all scrollable elements on the page. Scroll
// events don't bubble, so a delegated capture-phase listener on the
// document catches them as they fire on whichever ancestor is actually
// scrolling. We track the latest scrollTop of the element that fired.
function useDocumentScrollY() {
  const [y, setY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const handler = (e: Event) => {
      const target = e.target as Element | Document | null;
      if (!target) return;
      const el =
        target === document
          ? document.documentElement
          : (target as HTMLElement);
      const next =
        el === document.documentElement
          ? window.scrollY
          : (el as HTMLElement).scrollTop ?? 0;
      // Throttle to next animation frame so we batch reads + style updates.
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(next));
    };
    document.addEventListener("scroll", handler, { capture: true, passive: true });
    return () => {
      document.removeEventListener("scroll", handler, { capture: true });
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return y;
}
