const skeletonRows = Array.from({ length: 4 });

export default function ArchiveTableSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/60 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Fee</th>
              <th className="px-4 py-2">Paid</th>
              <th className="px-4 py-2">Balance</th>
              <th className="px-4 py-2">Sales</th>
              <th className="px-4 py-2">Downloads</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>

          <tbody className="animate-pulse">
            {skeletonRows.map((_, index) => (
              <tr
                key={index}
                className="border-t border-gold/20"
              >
                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-28 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-10 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}