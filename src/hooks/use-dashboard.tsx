"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchDashboard } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
}

interface UseDashboardResult extends DashboardState {
  refetch: () => Promise<void>;
}

const INITIAL_STATE: DashboardState = {
  data: null,
  loading: true,
  error: null,
};

const DashboardContext = createContext<UseDashboardResult | null>(null);

// Mounts once at the layout level — fetches the intelligence payload a single
// time and shares it with every page underneath. Tab switches read from
// context, no refetch.
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);

  const load = useCallback(async () => {
    try {
      const data = await fetchDashboard();
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        loading: false,
        error: e instanceof Error ? e : new Error(String(e)),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchDashboard().then(
      (data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      },
      (e) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const value: UseDashboardResult = { ...state, refetch: load };
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): UseDashboardResult {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used inside <DashboardProvider>");
  }
  return ctx;
}
