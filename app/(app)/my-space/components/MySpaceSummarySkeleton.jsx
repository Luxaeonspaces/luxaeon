export default function MySpaceSummarySkeleton() {
  return (
    <div className="grid animate-pulse gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="glass-card p-4"
        >
          <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
          <div className="h-5 w-40 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}