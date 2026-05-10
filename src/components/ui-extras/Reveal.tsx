"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";

// Scroll-triggered entrance wrapper. The fade-rise keyframe used to fire on
// mount; now it waits for IntersectionObserver to confirm the element is in
// the viewport before applying the animation class. Items above the fold
// fire immediately since they're visible from the start.
//
// We render the element as initially hidden (`opacity: 0`, slight Y offset)
// so it doesn't flash unanimated before the observer kicks in.
interface RevealProps {
  children: ReactNode;
  delay?: number; // milliseconds
  className?: string;
  as?: "div" | "section" | "article";
  style?: CSSProperties;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  style,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`${inView ? "fade-rise" : ""} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        // Pre-animation state: hidden + slightly translated. Once inView, the
        // fade-rise keyframe overrides these by animating to opacity:1 / Y:0.
        opacity: inView ? undefined : 0,
        transform: inView ? undefined : "translateY(14px)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
