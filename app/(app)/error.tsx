"use client";

import { useEffect } from "react";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Authenticated page error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
      <section className="glass-card w-full space-y-4 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">Page unavailable</p>
        <h1 className="font-display text-2xl font-semibold text-burgundy">We could not load this section</h1>
        <p className="text-sm text-gray-600">
          Your work is safe. Try again, or return to the dashboard and continue from there.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <a href="/dashboard" className="rounded-xl border border-gold/50 bg-white/80 px-4 py-2.5 text-sm font-semibold text-burgundy">
            Dashboard
          </a>
        </div>
      </section>
    </div>
  );
}
