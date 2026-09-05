export default function TransactionDownloads({ transactionId }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/finance/export?id=${transactionId}&format=csv`}
        className="btn-primary"
      >
        Download this transaction (CSV)
      </a>

      <a
        href={`/api/finance/export?id=${transactionId}&format=pdf`}
        className="rounded-xl border border-gold/50 bg-white/80 px-4 py-2 text-sm font-semibold text-burgundy"
      >
        Download PDF
      </a>
    </div>
  );
}