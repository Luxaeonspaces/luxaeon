const skeletonRows = Array.from({ length: 8 });

export default function ActivityTableSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Dept</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>

          <tbody className="animate-pulse">
            {skeletonRows.map((_, index) => (
              <tr
                key={index}
                className="border-t border-gold/20"
              >
                <td className="px-4 py-3">
                  <div className="h-3 w-28 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-40 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}