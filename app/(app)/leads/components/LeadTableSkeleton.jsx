const skeletonRows = Array.from({ length: 8 });

export default function LeadTableSkeleton() {
  return (
    <div className="glass-card animate-pulse overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
          <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Source</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Sales owner</th>
            <th className="px-4 py-2">Message / Notes</th>
            <th className="px-4 py-2">Created</th>
          </tr>
        </thead>

        <tbody>
          {skeletonRows.map((_, index) => (
            <tr
              key={index}
              className="border-t border-gold/20"
            >
              {Array.from({ length: 8 }).map((_, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}