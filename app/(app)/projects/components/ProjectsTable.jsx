import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProjectsTable() {
  const projects = await prisma.project.findMany({
    where: { NOT: { OR: [{ status: "Completed" }, { stage: "Completed" }] } },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      projectCode: true,
      clientName: true,
      stage: true,
      designFee: true,
      amountPaid: true,
      createdBy: true,
      salesPersonName: true,
      clientAccessCode: true,
    },
  });

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Code</th>
            <th className="px-4 py-2">Client</th>
            <th className="px-4 py-2">Stage</th>
            <th className="px-4 py-2">Fee</th>
            <th className="px-4 py-2">Paid</th>
            <th className="px-4 py-2">Balance</th>
            <th className="px-4 py-2">Created by</th>
            <th className="px-4 py-2">Sales</th>
            <th className="px-4 py-2">Access</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const balance = Math.max(0, (p.designFee || 0) - (p.amountPaid || 0));
            return (
              <tr key={p.id} className="border-t border-gray-200">
                <td className="px-4 py-2 font-medium">{p.projectCode}</td>
                <td className="px-4 py-2">{p.clientName}</td>
                <td className="px-4 py-2">{p.stage}</td>
                <td className="px-4 py-2">₦{(p.designFee || 0).toLocaleString()}</td>
                <td className="px-4 py-2">₦{(p.amountPaid || 0).toLocaleString()}</td>
                <td className="px-4 py-2 font-medium text-brown">₦{balance.toLocaleString()}</td>
                <td className="px-4 py-2 text-gray-600">{p.createdBy || "—"}</td>
                <td className="px-4 py-2 text-gray-600">{p.salesPersonName || "—"}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.clientAccessCode || "—"}</td>
                <td className="px-4 py-2">
                  <Link href={`/projects/${p.projectCode}`} className="text-brown underline">
                    Open
                  </Link>
                </td>
              </tr>
            );
          })}
          {projects.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                No projects yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}