export default function LeaveSummarySkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="glass-card p-4 text-center"
        >
          <div className="mx-auto mb-2 h-3 w-28 rounded bg-gray-200" />

          <div className="mx-auto h-8 w-12 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}