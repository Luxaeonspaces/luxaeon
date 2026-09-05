import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArchiveTable() {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { status: "Completed" },
        { stage: "Completed" },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="glass-card overflow-hidden">
      <div className="table-scroll">
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
            {projects.map((project) => {
              const balance = Math.max(
                0,
                (project.designFee || 0) -
                  (project.amountPaid || 0)
              );

              const code = encodeURIComponent(
                project.projectCode
              );

              return (
                <tr
                  key={project.id}
                  className="border-t border-gold/20"
                >
                  <td className="px-4 py-2 font-medium">
                    {project.projectCode}
                  </td>

                  <td className="px-4 py-2">
                    {project.clientName}
                  </td>

                  <td className="px-4 py-2">
                    ₦{(project.designFee || 0).toLocaleString()}
                  </td>

                  <td className="px-4 py-2">
                    ₦{(project.amountPaid || 0).toLocaleString()}
                  </td>

                  <td className="px-4 py-2">
                    ₦{balance.toLocaleString()}
                  </td>

                  <td className="px-4 py-2 text-gray-600">
                    {project.salesPersonName || "—"}
                  </td>

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
                    <Link
                      href={`/projects/${project.projectCode}`}
                      className="text-burgundy underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}

            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No completed projects yet. Use{" "}
                  <strong>Mark project completed</strong>{" "}
                  on a project detail page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}