"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <div className="relative">
        <Loader2 className="relative w-7 h-7 animate-spin text-[#B08968]" />
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
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#F8ECE8] border border-[#EBCEC4]">
          <AlertTriangle className="w-6 h-6 text-[#D57A66]" />
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
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#7F5539] text-white rounded-lg hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(127,85,57,0.25)]"
          style={{ fontWeight: 600 }}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
