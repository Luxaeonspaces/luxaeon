import { prisma } from "@/lib/prisma";
import AuditTable from "./AuditTable";
import { formatWAT } from "./format";

const columns = [
  { header: "When", render: (w) => formatWAT(w.createdAt), className: "text-xs whitespace-nowrap" },
  { header: "Who", render: (w) => w.fullName },
  { header: "Dept", render: (w) => w.department || "—" },
  { header: "Action", render: (w) => w.action, className: "text-brown" },
  { header: "Details", render: (w) => w.details || w.entityId, className: "text-gray-600" },
];

export default async function ProjectReport() {
  const work = await prisma.workActivity.findMany({
    where: {
      OR: [
        { action: { contains: "Project" } },
        { entityType: "project" },
        { action: { contains: "Lead" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AuditTable title="Project & sales activity" columns={columns} rows={work} emptyMessage="No project activity yet" />
  );
}