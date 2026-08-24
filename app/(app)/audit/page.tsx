import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AuditPage() {
  const { perms } = await requireUser();
  if (!perms.canSeeAudit) redirect("/dashboard");
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Audit Logs</h1>
      </div>
      <div className="glass-card overflow-hidden">
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
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-gold/20">
                <td className="px-4 py-2 text-xs">{l.createdAt.toISOString().slice(0, 19)}</td>
                <td className="px-4 py-2">
                  {l.fullName} ({l.role})
                </td>
                <td className="px-4 py-2">{l.action}</td>
                <td className="px-4 py-2 text-gray-600">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
