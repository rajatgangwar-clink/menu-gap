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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground">M</span>
          </div>
          <span className="text-lg text-sidebar-foreground" style={{ fontWeight: 600 }}>
            Menu Gap
          </span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div
          className="px-1 mb-1 text-xs uppercase tracking-wider text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          Store
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
            className="w-full flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-sidebar-accent/60 transition-colors"
          >
            <span
              className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-amber-400 to-rose-400 text-white flex items-center justify-center text-xs"
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border z-50">
              {stores.map((store) => (
                <button
                  key={store}
                  onClick={() => {
                    setSelectedStore(store);
                    setStoreSwitcherOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 first:rounded-t-lg last:rounded-b-lg"
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
              className="px-3 mb-2 text-xs uppercase tracking-wider text-muted-foreground"
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-sidebar-foreground truncate">John Mathew</div>
            <div className="text-xs text-muted-foreground">Owner</div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Strips the "The Daily Grind - " prefix so the visible label is just the location.
function storeShortName(full: string): string {
  const parts = full.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : full;
}
