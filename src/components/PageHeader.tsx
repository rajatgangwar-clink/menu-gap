"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional extra action buttons rendered before the default bell + settings icons. */
  actions?: ReactNode;
  /** Optional content rendered inside the same card below the title row (e.g. search/filter toolbar). */
  children?: ReactNode;
  /** Notification count shown on the bell badge. Hidden when 0. Capped at 99 — anything higher renders as "8+". */
  notificationCount?: number;
}

// Scroll position past which the header collapses into its compact mode.
const SHRINK_THRESHOLD = 56;

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  notificationCount = 8,
}: PageHeaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shrunk, setShrunk] = useState(false);

  // Each page has its own scroll container (the .overflow-y-auto wrapper in
  // the page component) — find the nearest scrollable ancestor and attach a
  // scroll listener to it. We can't rely on window scroll since the body
  // itself doesn't scroll.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const scrollable = findScrollParent(wrapper);
    if (!scrollable) return;

    const handler = () => {
      const top =
        scrollable === document.documentElement
          ? window.scrollY
          : (scrollable as HTMLElement).scrollTop;
      setShrunk(top > SHRINK_THRESHOLD);
    };
    handler();
    scrollable.addEventListener("scroll", handler, { passive: true });
    return () => scrollable.removeEventListener("scroll", handler);
  }, []);

  return (
    // Sticky positioning so the header stays at the top of the scroll
    // container; the negative top margin compensates for the parent's p-6
    // so the header docks flush to the chrome edge once collapsed.
    <div
      ref={wrapperRef}
      className="sticky -top-6 -mx-6 px-6 -mt-6 pt-6 z-30"
    >
      <header
        className={`relative rounded-2xl fade-rise overflow-hidden transition-all duration-300 ease-out ${
          shrunk
            ? "glass-strong px-5 py-3 shadow-lg shadow-black/30"
            : "glass px-6 py-5"
        }`}
        style={{
          // Slight scale-down when shrunk for an organic shrink, not just padding shrinking.
          transform: shrunk ? "scale(0.985)" : "scale(1)",
          transformOrigin: "top center",
        }}
      >
        {/* Soft gradient sheen across the top of the header card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1
              className={`truncate bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 transition-all duration-300 ${
                shrunk ? "text-lg leading-tight" : ""
              }`}
              style={{ fontWeight: 700 }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`text-sm text-muted-foreground transition-all duration-300 overflow-hidden ${
                  shrunk
                    ? "max-h-0 opacity-0 mt-0"
                    : "max-h-8 opacity-100 mt-1"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            <button
              type="button"
              aria-label="Notifications"
              className={`relative rounded-full glass border border-white/10 hover:border-white/25 transition-all duration-300 flex items-center justify-center ${
                shrunk ? "w-9 h-9" : "w-10 h-10"
              }`}
            >
              <Bell className={`text-foreground transition-all ${shrunk ? "w-4 h-4" : "w-5 h-5"}`} />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-[10px] flex items-center justify-center shadow-lg shadow-fuchsia-900/40 ring-2 ring-[#06070f]"
                  style={{ fontWeight: 700 }}
                >
                  {formatBadge(notificationCount)}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="Account"
              className={`relative rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 text-white hover:opacity-90 transition-all duration-300 flex items-center justify-center text-sm shadow-lg shadow-violet-900/40 ring-1 ring-white/20 ${
                shrunk ? "w-9 h-9 text-xs" : "w-10 h-10"
              }`}
              style={{ fontWeight: 700 }}
            >
              JM
            </button>
          </div>
        </div>
        {children && (
          // Collapse the toolbar slot too — saves a lot of vertical space on
          // pages that put a search/filter row in the header (AI Assistance).
          <div
            className={`transition-all duration-300 overflow-hidden ${
              shrunk ? "max-h-0 opacity-0 mt-0" : "max-h-32 opacity-100 mt-4"
            }`}
          >
            {children}
          </div>
        )}
      </header>
    </div>
  );
}

// Walk up the DOM looking for the nearest ancestor with overflow auto/scroll
// on Y. Falls back to documentElement if nothing matches.
function findScrollParent(node: HTMLElement): Element {
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.documentElement;
}

function formatBadge(count: number): string {
  if (count > 8) return "8+";
  return String(count);
}
