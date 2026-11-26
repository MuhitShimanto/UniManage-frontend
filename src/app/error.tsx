"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <Button onClick={reset} className="mt-6">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
