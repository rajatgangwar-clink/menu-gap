"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getRestaurant, type RestaurantProfile } from "@/lib/auth";

// Subscribes to the auth store's "menugap:auth-change" event so any component
// reading the restaurant profile updates automatically on login/logout/refresh.
export function useRestaurant(): RestaurantProfile | null {
  const subscribe = useCallback((cb: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("menugap:auth-change", cb);
    return () => window.removeEventListener("menugap:auth-change", cb);
  }, []);
  const getSnapshot = useCallback(() => getRestaurant(), []);
  const getServerSnapshot = useCallback(() => null, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
