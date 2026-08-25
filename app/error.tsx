"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="glass-card w-full max-w-lg space-y-4 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">Something went wrong</p>
        <h1 className="font-display text-2xl font-semibold text-burgundy">We could not load this page</h1>
        <p className="text-sm text-gray-600">
          Please try again. If the problem continues, check the server configuration and database connection.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <a href="/login" className="rounded-xl border border-gold/50 bg-white/80 px-4 py-2.5 text-sm font-semibold text-burgundy">
            Return to login
          </a>
        </div>
      </section>
    </main>
  );
}
