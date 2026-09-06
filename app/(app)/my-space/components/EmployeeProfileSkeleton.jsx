export default function EmployeeProfileSkeleton() {
  return (
    <section className="glass-card animate-pulse p-5">
      <div className="mb-2 h-5 w-48 rounded bg-gray-200" />

      <div className="mb-4 h-3 w-72 rounded bg-gray-200" />

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gold/20 bg-white/50 px-3 py-3"
          >
            <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
}