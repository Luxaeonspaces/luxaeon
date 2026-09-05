export default function LeaveTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="text-xs uppercase text-gray-500">
          <tr>
            <th className="py-1">Employee</th>
            <th className="py-1">Dates</th>
            <th className="py-1">Days</th>
            <th className="py-1">Status</th>
            <th className="py-1">Approvals</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((leave) => (
            <tr
              key={leave.id}
              className="border-t border-gold/20"
            >
              <td className="py-2">
                {leave.employeeName}
              </td>

              <td className="py-2">
                {leave.startDate} → {leave.endDate}
              </td>

              <td className="py-2">
                {leave.days}
              </td>

              <td className="py-2">
                {leave.status}
              </td>

              <td className="py-2 text-xs">
                HOD: {leave.hodApprovedBy || "—"} · HR:{" "}
                {leave.hrApprovedBy || "—"}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="py-4 text-center text-gray-500"
              >
                No leave records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}