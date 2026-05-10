"use client";

import { User, Bell, MapPin, Database, Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export function Settings() {
  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-6 space-y-6">
        <PageHeader title="Settings" subtitle="Manage your account and preferences" />
        <SettingsCard icon={<User className="w-5 h-5 text-primary" />} title="Account Settings">
          <Row label="Name" value="John Mathew" action="Edit" />
          <Row label="Email" value="john@thedailygrind.com" action="Edit" />
          <Row label="Password" value="••••••••" action="Change" />
        </SettingsCard>

        <SettingsCard icon={<MapPin className="w-5 h-5 text-primary" />} title="Cafe Settings">
          <Row label="Primary Location" value="The Daily Grind - HSR Layout" action="Change" />
          <Row label="Analysis Radius" value="2 km (14 competitors)" action="Adjust" />
          <Row label="Menu Items" value="10 items tracked" action="Manage" />
        </SettingsCard>

        <SettingsCard icon={<Bell className="w-5 h-5 text-primary" />} title="Notifications">
          <Toggle label="Weekly Trend Report" description="Get a summary of trending dishes every Monday" defaultChecked />
          <Toggle label="Gap Alerts" description="Notify when competitors add high-rated dishes" defaultChecked />
          <Toggle label="Pricing Updates" description="Alert when market prices change significantly" />
        </SettingsCard>

        <SettingsCard icon={<Database className="w-5 h-5 text-primary" />} title="Data & Privacy">
          <Row label="Data Refresh" value="Last updated: 2 hours ago" action="Refresh Now" />
          <Row label="Export Data" value="Download your menu and performance data" action="Download" />
          <Row label="Privacy Settings" value="Manage what data we collect and how we use it" action="Manage" />
        </SettingsCard>

        <div className="bg-card rounded-xl border border-destructive/20">
          <div className="p-6 border-b border-destructive/20 flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <h3 className="text-destructive">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm mb-1" style={{ fontWeight: 600 }}>
                  Delete Account
                </div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </div>
              </div>
              <button className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border flex items-center gap-2">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
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
        <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors">
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
          <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform"></div>
        </label>
      </div>
    </div>
  );
}
