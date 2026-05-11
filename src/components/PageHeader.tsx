"use client";

import { Bell, HelpCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional extra action buttons rendered before the default bell + avatar. */
  actions?: ReactNode;
  /** Optional content rendered inside the same card below the title row. */
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, children }: PageHeaderProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header className="bg-card border border-border rounded-2xl px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {actions}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setOpen((o) => !o)}
              className="w-10 h-10 rounded-full bg-muted/60 hover:bg-muted transition-colors flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-foreground" />
            </button>
            {open && <NotificationsPanel onClose={() => setOpen(false)} />}
          </div>
          <Link
            href="/faqs"
            aria-label="Help"
            className="w-10 h-10 rounded-full bg-muted/60 hover:bg-muted transition-colors flex items-center justify-center"
          >
            <HelpCircle className="w-5 h-5 text-foreground" />
          </Link>
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[320px] bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm" style={{ fontWeight: 700 }}>
            Notifications
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">You&apos;re all caught up</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          aria-label="Close notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 mx-auto mb-3 flex items-center justify-center">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          We&apos;ll let you know when something needs your attention.
        </p>
      </div>
    </div>
  );
}
