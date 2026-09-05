const skeletonItems = Array.from({ length: 6 });

export default function DocumentsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <section className="space-y-3">
        <div className="h-5 w-48 rounded bg-gray-200" />

        <div className="glass-card grid gap-3 p-5 sm:grid-cols-2">
          {skeletonItems.map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-gold/20 bg-white/70 px-4 py-3"
            >
              <div className="h-4 w-40 rounded bg-gray-200" />

              <div className="h-3 w-10 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}