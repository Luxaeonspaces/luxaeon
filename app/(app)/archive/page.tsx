import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams?: { ok?: string };
}) {
  await requireUser();
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ status: "Completed" }, { stage: "Completed" }],
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Project Archives</h1>
        <p className="relative z-10 text-sm text-white/80">
          Completed projects · view &amp; download only · {projects.length} archived
        </p>
      </div>

      {searchParams?.ok && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{searchParams.ok}</p>
      )}

      <div className="glass-card overflow-hidden">
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
          <tbody>
            {projects.map((p) => {
              const balance = Math.max(0, (p.designFee || 0) - (p.amountPaid || 0));
              const code = encodeURIComponent(p.projectCode);
              return (
                <tr key={p.id} className="border-t border-gold/20">
                  <td className="px-4 py-2 font-medium">{p.projectCode}</td>
                  <td className="px-4 py-2">{p.clientName}</td>
                  <td className="px-4 py-2">₦{(p.designFee || 0).toLocaleString()}</td>
                  <td className="px-4 py-2">₦{(p.amountPaid || 0).toLocaleString()}</td>
                  <td className="px-4 py-2">₦{balance.toLocaleString()}</td>
                  <td className="px-4 py-2 text-gray-600">{p.salesPersonName || "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      <a
                        className="text-xs text-burgundy underline"
                        href={`/api/export/project-history?projectCode=${code}&format=csv`}
                      >
                        History Excel
                      </a>
                      <a
                        className="text-xs text-burgundy underline"
                        href={`/api/export/project-history?projectCode=${code}&format=pdf`}
                      >
                        History PDF
                      </a>
                      <a
                        className="text-xs text-burgundy underline"
                        href={`/api/export/project-history?projectCode=${code}&format=word`}
                      >
                        History Word
                      </a>
                      <a
                        className="text-xs text-burgundy underline"
                        href={`/api/export/project?projectCode=${code}`}
                      >
                        Details Excel
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/projects/${p.projectCode}`} className="text-burgundy underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No completed projects yet. Use <strong>Mark project completed</strong> on a project detail page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
