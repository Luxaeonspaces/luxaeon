export default function PayrollSectionSkeleton() {
  return (
    <section className="glass-card animate-pulse overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3">
        <div className="h-5 w-40 rounded bg-gray-200" />
      </div>

      <div className="overflow-x-auto p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4"
            >
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}