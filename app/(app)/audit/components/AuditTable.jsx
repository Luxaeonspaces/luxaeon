import { prisma } from "@/lib/prisma";

export default async function AuditTable() {
  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <div className="glass-card overflow-hidden">
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
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-gold/20"
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs">
                  {log.createdAt
                    .toISOString()
                    .slice(0, 19)}
                </td>

                <td className="px-4 py-2">
                  {log.fullName} ({log.role})
                </td>

                <td className="px-4 py-2 font-medium text-burgundy">
                  {log.action}
                </td>

                <td className="px-4 py-2 text-gray-600">
                  {log.details || "—"}
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}