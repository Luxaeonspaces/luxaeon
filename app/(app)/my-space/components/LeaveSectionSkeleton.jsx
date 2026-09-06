export default function LeaveSectionSkeleton() {
  return (
    <section className="glass-card animate-pulse p-5">
      <div className="mb-4 h-5 w-32 rounded bg-gray-200" />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-10 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
        <div className="h-16 rounded bg-gray-200 md:col-span-2" />
        <div className="h-10 rounded bg-gray-200 md:col-span-2" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-5 rounded bg-gray-200"
          />
        ))}
      </div>
    </section>
  );
}