export default function ActivitySummarySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="glass-card animate-pulse p-4 text-center"
        >
          <div className="mx-auto h-7 w-10 rounded bg-gray-200" />

          <div className="mx-auto mt-2 h-3 w-20 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}