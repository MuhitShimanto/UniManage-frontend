"use client";

import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <AlertOctagon className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Critical Application Error</h2>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          {error.message || "A critical error occurred."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Reload Application
        </button>
      </body>
    </html>
  );
}
