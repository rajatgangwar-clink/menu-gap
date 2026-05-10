"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  UtensilsCrossed,
  Sparkles,
  HelpCircle,
  Settings as SettingsIcon,
  ChevronDown,
  User,
  MoreVertical,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "./LogoutButton";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavGroup = {
  heading: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    heading: "Menu",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/trending", label: "Trending", icon: TrendingUp },
      { href: "/novelty", label: "Novelty", icon: Sparkles },
      { href: "/my-dishes", label: "My Dishes", icon: UtensilsCrossed },
      { href: "/ai-assistance", label: "AI Assistance", icon: MessageCircle },
    ],
  },
  {
    heading: "Others",
    items: [
      { href: "/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

const stores = [
  "The Daily Grind - HSR Layout",
  "The Daily Grind - Koramangala",
  "The Daily Grind - Indiranagar",
];

export function Sidebar() {
  const pathname = usePathname();
  const [storeSwitcherOpen, setStoreSwitcherOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(stores[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStoreSwitcherOpen(false);
      }
    }
    if (storeSwitcherOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [storeSwitcherOpen]);

  return (
    <div className="relative w-64 h-screen flex flex-col glass border-r border-sidebar-border overflow-hidden">
      {/* Subtle inner highlight along the right edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-violet-400/30 to-transparent"
      />

      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-md opacity-60" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <span className="text-white" style={{ fontWeight: 700 }}>M</span>
            </div>
          </div>
          <span
            className="text-lg shimmer-text"
            style={{ fontWeight: 700, fontFamily: "var(--font-heading)" }}
          >
            Menu Gap
          </span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div
          className="px-1 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Store
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/10 transition-all"
          >
            <span
              className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-amber-400 via-rose-400 to-fuchsia-400 text-white flex items-center justify-center text-xs shadow-lg shadow-rose-900/30"
              style={{ fontWeight: 700 }}
            >
              {selectedStore.charAt(0)}
            </span>
            <span className="flex-1 text-left text-sm text-sidebar-foreground truncate">
              {storeShortName(selectedStore)}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>

          {storeSwitcherOpen && (
            // Solid popover surface — backdrop-filter would be blurring the
            // sidebar's own glass layer (it can't see past a parent stacking
            // context), so we use the opaque --popover token plus a soft
            // shadow to read as a floating menu.
            <div
              className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-white/10 z-50 overflow-hidden bg-popover shadow-xl shadow-black/40 ring-1 ring-white/5"
            >
              {stores.map((store) => (
                <button
                  key={store}
                  onClick={() => {
                    setSelectedStore(store);
                    setStoreSwitcherOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors"
                >
                  {store}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        {navGroups.map((group, groupIndex) => (
          <div key={group.heading} className={groupIndex === 0 ? "" : "mt-6"}>
            <div
              className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              style={{ fontWeight: 600 }}
            >
              {group.heading}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? "text-white"
                        : "text-sidebar-foreground/80 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {isActive && (
                      <>
                        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/80 via-indigo-500/70 to-fuchsia-500/60 shadow-lg shadow-violet-900/40" />
                        <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                        <span className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 blur-md opacity-70 -z-10" />
                      </>
                    )}
                    <Icon className="relative w-5 h-5 flex-shrink-0" />
                    <span className="relative text-sm" style={{ fontWeight: isActive ? 600 : 500 }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 blur-md opacity-50" />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-sidebar-foreground truncate" style={{ fontWeight: 600 }}>
              John Mathew
            </div>
            <div className="text-xs text-muted-foreground">Owner</div>
          </div>
        </div>
        <LogoutButton 
          variant="outline"
          className="w-full justify-center text-xs"
        />
      </div>
    </div>
  );
}

// Strips the "The Daily Grind - " prefix so the visible label is just the location.
function storeShortName(full: string): string {
  const parts = full.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : full;
}
