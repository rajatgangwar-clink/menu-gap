"use client";

import { Bell } from "lucide-react";
import type { ReactNode } from "react";

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

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  notificationCount = 8,
}: PageHeaderProps) {
  return (
    <header className="bg-card border border-border rounded-2xl px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          <button
            type="button"
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full bg-muted/60 hover:bg-muted transition-colors flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {notificationCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center"
                style={{ fontWeight: 600 }}
              >
                {formatBadge(notificationCount)}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label="Account"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center text-sm shadow-sm"
            style={{ fontWeight: 700 }}
          >
            JM
          </button>
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}

function formatBadge(count: number): string {
  if (count > 8) return "8+";
  return String(count);
}
