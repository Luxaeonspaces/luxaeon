"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label = "← Previous" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="rounded-xl border border-gold/40 bg-white/80 px-4 py-2 text-sm font-medium text-burgundy transition hover:bg-cream"
    >
      {label}
    </button>
  );
}
