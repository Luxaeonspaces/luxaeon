const skeletonRows = Array.from({ length: 6 });

export default function TransactionAuditSkeleton() {
  return (
    <div className="glass-card animate-pulse overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
      </div>

      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>

          <tbody>
            {skeletonRows.map((_, index) => (
              <tr
                key={index}
                className="border-t border-gold/20"
              >
                <td className="px-4 py-3">
                  <div className="h-3 w-28 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-32 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-48 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}