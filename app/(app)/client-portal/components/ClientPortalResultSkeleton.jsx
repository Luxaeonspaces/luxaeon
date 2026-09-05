export default function ClientPortalResultSkeleton() {
  return (
    <div className="glass-card animate-pulse space-y-5 p-5">
      <div className="h-6 w-48 rounded bg-gray-200" />

      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-4 w-48 rounded bg-gray-200" />
        <div className="h-4 w-56 rounded bg-gray-200" />
      </div>

      <div className="pt-2">
        <div className="h-4 w-24 rounded bg-gray-200" />

        <div className="mt-3 space-y-2">
          <div className="h-3 w-64 rounded bg-gray-200" />
          <div className="h-3 w-56 rounded bg-gray-200" />
          <div className="h-3 w-60 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}