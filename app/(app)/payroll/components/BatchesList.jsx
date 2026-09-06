import { prisma } from "@/lib/prisma";
import BatchCard from "./BatchCard";

export default async function BatchesList({ perms }) {
  const batches = await prisma.payrollBatch.findMany({
    include: { records: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <>
      {batches.map((b) => (
        <BatchCard key={b.id} b={b} perms={perms} />
      ))}
      {batches.length === 0 && <p className="text-gray-500">No payroll batches yet</p>}
    </>
  );
}