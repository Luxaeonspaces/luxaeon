export default function FinanceSummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="glass-card animate-pulse p-4 text-center"
        >
          <div className="mx-auto h-3 w-20 rounded bg-gray-200" />

          <div className="mx-auto mt-2 h-7 w-32 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}