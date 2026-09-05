export default function LeaveTableSkeleton() {
  return (
    <div className="glass-card animate-pulse p-5">
      <div className="mb-4 h-5 w-32 rounded bg-gray-200" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr>
              {Array.from({ length: 5 }).map((_, index) => (
                <th key={index} className="py-2">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-gold/20"
              >
                {Array.from({ length: 5 }).map(
                  (_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="py-3"
                    >
                      <div className="h-3 w-24 rounded bg-gray-200" />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}