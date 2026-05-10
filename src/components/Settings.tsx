"use client";

import { User, Bell, MapPin, Database, Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { Reveal } from "@/components/ui-extras/Reveal";

export function Settings() {
  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-6 space-y-6">
        <PageHeader title="Settings" subtitle="Manage your account and preferences" />

        <Reveal delay={120}>
          <SettingsCard icon={<User className="w-5 h-5" />} accent="violet" title="Account Settings">
            <Row label="Name" value="John Mathew" action="Edit" />
            <Row label="Email" value="john@thedailygrind.com" action="Edit" />
            <Row label="Password" value="••••••••" action="Change" />
          </SettingsCard>
        </Reveal>

        <Reveal delay={200}>
          <SettingsCard icon={<MapPin className="w-5 h-5" />} accent="cyan" title="Cafe Settings">
            <Row label="Primary Location" value="The Daily Grind - HSR Layout" action="Change" />
            <Row label="Analysis Radius" value="2 km (14 competitors)" action="Adjust" />
            <Row label="Menu Items" value="10 items tracked" action="Manage" />
          </SettingsCard>
        </Reveal>

        <Reveal delay={280}>
          <SettingsCard icon={<Bell className="w-5 h-5" />} accent="amber" title="Notifications">
            <Toggle label="Weekly Trend Report" description="Get a summary of trending dishes every Monday" defaultChecked />
            <Toggle label="Gap Alerts" description="Notify when competitors add high-rated dishes" defaultChecked />
            <Toggle label="Pricing Updates" description="Alert when market prices change significantly" />
          </SettingsCard>
        </Reveal>

        <Reveal delay={360}>
          <SettingsCard icon={<Database className="w-5 h-5" />} accent="emerald" title="Data & Privacy">
            <Row label="Data Refresh" value="Last updated: 2 hours ago" action="Refresh Now" />
            <Row label="Export Data" value="Download your menu and performance data" action="Download" />
            <Row label="Privacy Settings" value="Manage what data we collect and how we use it" action="Manage" />
          </SettingsCard>
        </Reveal>

        <Reveal delay={440}>
          <div className="relative rounded-2xl overflow-hidden border border-rose-400/30 glass">
            <div
              aria-hidden
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-25 bg-rose-500"
            />
            <div className="relative p-6 border-b border-rose-400/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-300" />
              </div>
              <h3 className="text-rose-300">Danger Zone</h3>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm mb-1" style={{ fontWeight: 600 }}>
                    Delete Account
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </div>
                </div>
                <button
                  className="px-4 py-2 text-sm bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-rose-900/40"
                  style={{ fontWeight: 600 }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

const ACCENTS: Record<
  "violet" | "cyan" | "amber" | "emerald",
  { iconBg: string; iconColor: string; glow: string }
> = {
  violet: {
    iconBg: "bg-violet-500/15 border-violet-400/30",
    iconColor: "text-violet-300",
    glow: "bg-violet-500",
  },
  cyan: {
    iconBg: "bg-cyan-500/15 border-cyan-400/30",
    iconColor: "text-cyan-300",
    glow: "bg-cyan-500",
  },
  amber: {
    iconBg: "bg-amber-500/15 border-amber-400/30",
    iconColor: "text-amber-300",
    glow: "bg-amber-500",
  },
  emerald: {
    iconBg: "bg-emerald-500/15 border-emerald-400/30",
    iconColor: "text-emerald-300",
    glow: "bg-emerald-500",
  },
};

function SettingsCard({
  icon,
  title,
  children,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent: "violet" | "cyan" | "amber" | "emerald";
}) {
  const cfg = ACCENTS[accent];
  return (
    <GlassCard className="overflow-hidden relative">
      <div
        aria-hidden
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 ${cfg.glow}`}
      />
      <div className="relative p-6 border-b border-border flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.iconBg} ${cfg.iconColor}`}
        >
          {icon}
        </div>
        <h3>{title}</h3>
      </div>
      <div className="relative divide-y divide-border">{children}</div>
    </GlassCard>
  );
}

function Row({ label, value, action }: { label: string; value: string; action: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm mb-1" style={{ fontWeight: 600 }}>
            {label}
          </div>
          <div className="text-sm text-muted-foreground">{value}</div>
        </div>
        <button className="px-4 py-2 text-sm border border-white/10 bg-white/[0.03] rounded-lg hover:bg-white/[0.07] hover:border-violet-400/30 transition-all">
          {action}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm mb-1" style={{ fontWeight: 600 }}>
            {label}
          </div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
          <div className="w-11 h-6 bg-white/[0.12] rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-fuchsia-500 peer-checked:shadow-lg peer-checked:shadow-violet-900/40 transition-all peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform after:shadow-md"></div>
        </label>
      </div>
    </div>
  );
}
