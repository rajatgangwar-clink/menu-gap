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
  LogOut,
  User,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { useRestaurant } from "@/hooks/use-restaurant";

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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const restaurant = useRestaurant();

  const handleLogout = () => {
    clearAuthToken();
    router.replace("/login");
  };

  const restaurantName = restaurant?.name ?? "Your Restaurant";

  return (
    <div className="relative w-64 h-screen flex flex-col glass border-r border-sidebar-border overflow-hidden">
      {/* Subtle inner highlight along the right edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[#E7DED2]"
      />

      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="relative w-9 h-9 rounded-xl bg-[#7F5539] flex items-center justify-center shadow-[0_4px_12px_rgba(127,85,57,0.25)]">
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
          Restaurant
        </div>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <span
            className="w-7 h-7 rounded-full flex-shrink-0 bg-[#B08968] text-white flex items-center justify-center text-xs"
            style={{ fontWeight: 700 }}
          >
            {restaurantName.charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 text-left text-sm text-sidebar-foreground truncate">
            {restaurantName}
          </span>
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
                        ? "text-[#FFF8F2]"
                        : "text-[#5A4F47] hover:text-[#2D2420] hover:bg-[#F4ECE3]"
                    }`}
                  >
                    {isActive && (
                      <>
                        <span className="absolute inset-0 rounded-xl bg-[#7F5539] shadow-[0_4px_12px_rgba(127,85,57,0.25)]" />
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
            <div className="relative w-10 h-10 rounded-full bg-[#7F5539] flex items-center justify-center">
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
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#EBCEC4] text-[#D57A66] hover:bg-[#F8ECE8] transition-colors text-sm"
          style={{ fontWeight: 600 }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

