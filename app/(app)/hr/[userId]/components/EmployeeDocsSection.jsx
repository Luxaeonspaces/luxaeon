import { prisma } from "@/lib/prisma";
import EmployeeDocs from "@/components/EmployeeDocs";

export default async function EmployeeDocsSection({ userId }) {
  const docs = await prisma.employeeDocument.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <EmployeeDocs
      userId={userId}
      docs={docs.map((d) => ({
        id: d.id,
        name: d.originalName || d.filename,
        filename: d.filename,
        category: d.category,
        by: d.uploadedBy,
        createdAt: d.createdAt.toISOString().slice(0, 10),
      }))}
    />
  );
}