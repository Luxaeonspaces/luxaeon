import { prisma } from "@/lib/prisma";

export default async function LeaveHistoryTable() {
  const allLeaves = await prisma.leaveRequest.findMany({ orderBy: { createdAt: "desc" }, take: 80 });

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 font-semibold text-brown">
        Leave history (all staff — Head of HR / HR)
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Employee</th>
            <th className="px-4 py-2">Dept</th>
            <th className="px-4 py-2">Dates</th>
            <th className="px-4 py-2">Days</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Approvals</th>
          </tr>
        </thead>
        <tbody>
          {allLeaves.map((l) => (
            <tr key={l.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{l.employeeName}</td>
              <td className="px-4 py-2">{l.department || "—"}</td>
              <td className="px-4 py-2">
                {l.startDate} → {l.endDate}
              </td>
              <td className="px-4 py-2">{l.days}</td>
              <td className="px-4 py-2">{l.status}</td>
              <td className="px-4 py-2 text-xs">
                HOD: {l.hodApprovedBy || "—"} · HR: {l.hrApprovedBy || "—"}
              </td>
            </tr>
          ))}
          {allLeaves.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                No leave records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}