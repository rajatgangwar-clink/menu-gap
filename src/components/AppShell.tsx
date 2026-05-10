"use client";

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardProvider } from "@/hooks/use-dashboard";
import { isAuthenticated } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/login"]);

type AuthState = "authed" | "guest";

function useAuthState(): AuthState {
  const subscribe = useCallback((cb: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("menugap:auth-change", cb);
    return () => window.removeEventListener("menugap:auth-change", cb);
  }, []);

  const getSnapshot = useCallback<() => AuthState>(
    () => (isAuthenticated() ? "authed" : "guest"),
    []
  );
  const getServerSnapshot = useCallback<() => AuthState>(() => "guest", []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authState = useAuthState();
  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (authState === "guest" && !isPublic) {
      router.replace("/login");
    } else if (authState === "authed" && isPublic) {
      router.replace("/");
    }
  }, [authState, isPublic, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (authState !== "authed") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </DashboardProvider>
  );
}
