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
          <div className="relative rounded-2xl overflow-hidden border border-[#EBCEC4] glass">
            <div className="relative p-6 border-b border-[#EBCEC4] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F8ECE8] border border-[#EBCEC4] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D57A66]" />
              </div>
              <h3 className="text-[#D57A66]">Danger Zone</h3>
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
                  className="px-4 py-2 text-sm bg-[#D57A66] text-white rounded-lg hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(213,122,102,0.25)]"
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
    iconBg: "bg-[#F4ECE3] border-[#E7DED2]",
    iconColor: "text-[#B08968]",
    glow: "bg-[#7F5539]",
  },
  cyan: {
    iconBg: "bg-[#DDB892]/15 border-[#CFE4D7]",
    iconColor: "text-[#5F8D73]",
    glow: "bg-[#DDB892]",
  },
  amber: {
    iconBg: "bg-[#FBF1E1] border-[#EBD9B6]",
    iconColor: "text-[#C38B59]",
    glow: "bg-[#C38B59]",
  },
  emerald: {
    iconBg: "bg-[#EDF5F0] border-[#CFE4D7]",
    iconColor: "text-[#5F8D73]",
    glow: "bg-[#5F8D73]",
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
        <button className="px-4 py-2 text-sm border border-[#E7DED2] bg-[#FCF8F3] rounded-lg hover:bg-[#F4ECE3] hover:border-[#E7DED2] transition-all">
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
          <div className="w-11 h-6 bg-[#E7DED2] rounded-full peer peer-checked:bg-[#B08968] peer-checked:shadow-lg peer-checked:shadow-[0_4px_12px_rgba(127,85,57,0.25)] transition-all peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform after:shadow-md"></div>
        </label>
      </div>
    </div>
  );
}
