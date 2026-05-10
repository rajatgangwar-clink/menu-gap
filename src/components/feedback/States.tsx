"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-xl" />
        <Loader2 className="relative w-7 h-7 animate-spin text-violet-300" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-xl" />
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/15 border border-rose-400/30">
          <AlertTriangle className="w-6 h-6 text-rose-300" />
        </div>
      </div>
      <div className="text-center max-w-md">
        <h3 className="mb-2">Could not load data</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "The dashboard service is unreachable. Try again in a moment."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-900/40"
          style={{ fontWeight: 600 }}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
