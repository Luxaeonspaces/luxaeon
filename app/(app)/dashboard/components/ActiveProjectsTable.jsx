import { prisma } from "@/lib/prisma";

export default async function ActiveProjectsTable() {
  const projects = await prisma.project.findMany({
    where: { status: "Active" },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 font-display font-semibold text-brown">Active Projects</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Stage</th>
              <th className="px-4 py-2">Created by</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-gray-200">
                <td className="px-4 py-2 font-medium">{p.projectCode}</td>
                <td className="px-4 py-2">{p.clientName}</td>
                <td className="px-4 py-2">{p.stage}</td>
                <td className="px-4 py-2 text-gray-600">{p.createdBy || "—"}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No projects yet — create your first one
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}