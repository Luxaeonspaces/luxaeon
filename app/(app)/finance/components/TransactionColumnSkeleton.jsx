const skeletonRows = Array.from({ length: 6 });

export default function TransactionColumnSkeleton() {
  return (
    <div className="glass-card animate-pulse overflow-hidden">
      <div className="flex items-center justify-between border-b border-gold/30 px-4 py-3">
        <div className="h-4 w-20 rounded bg-gray-200" />

        <div className="flex gap-2">
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="h-6 w-24 rounded bg-gray-200" />
        </div>
      </div>

      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Txn ID</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Sales person</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {skeletonRows.map((_, index) => (
              <tr
                key={index}
                className="border-t border-gold/20"
              >
                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-36 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </td>

                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
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