import { prisma } from "@/lib/prisma";
import AuditTable from "./AuditTable";
import { formatWAT } from "./Format";

const columns = [
  { header: "When", render: (l) => formatWAT(l.createdAt), className: "text-xs whitespace-nowrap" },
  { header: "Who", render: (l) => l.fullName || l.username },
  { header: "Dept", render: (l) => l.department || "—" },
  { header: "Action", render: (l) => l.action, className: "text-brown" },
  { header: "Details", render: (l) => l.details, className: "text-gray-600" },
];

export default async function LoginReport() {
  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [{ action: "Login" }, { action: { contains: "Password" } }, { action: { contains: "User" } }],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AuditTable title="Login & security audit" columns={columns} rows={logs} emptyMessage="No login events yet" />
  );
}