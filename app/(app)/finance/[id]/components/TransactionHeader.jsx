import Link from "next/link";

export default function TransactionHeader({ txnId }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <div className="main-header flex-1">
        <p className="relative z-10 text-xs text-gold/90">
          Transaction detail
        </p>

        <h1 className="relative z-10 font-display text-2xl font-semibold">
          {txnId}
        </h1>
      </div>

      <Link
        href="/finance"
        className="rounded-xl border border-gold/40 bg-white/80 px-4 py-2 text-sm text-burgundy self-center"
      >
        ← Finance
      </Link>
    </div>
  );
}