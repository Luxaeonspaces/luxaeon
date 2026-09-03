export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="main-header animate-pulse">
        <div className="h-6 w-40 rounded bg-white/25" />
        <div className="mt-2 h-4 w-64 rounded bg-white/15" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card h-24 animate-pulse p-4">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="mt-3 h-5 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="glass-card h-64 animate-pulse p-4">
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
    </div>
  );
}