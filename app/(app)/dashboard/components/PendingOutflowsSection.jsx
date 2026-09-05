import { prisma } from "@/lib/prisma";

export default async function PendingOutflowsSection({ userId, department, perms }) {
  const pendingOutflows = await prisma.outflowRequest.findMany({
    where: {
      status: { in: ["Pending Department", "Pending Founder", "Pending Finance"] },
      ...(perms.isFounder
        ? {}
        : perms.isHod && department
          ? { department }
          : { requestedById: userId }),
    },
    orderBy: { requestDate: "desc" },
    take: 8,
  });

  if (!(perms.isFounder || perms.isHod || pendingOutflows.length > 0)) return null;

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 font-semibold text-brown">
        Pending outflow approvals {perms.isFounder ? "(all depts)" : perms.isHod ? `(${department})` : "(yours)"}
      </div>
      <ul className="divide-y divide-gray-200 text-sm">
        {pendingOutflows.map((o) => (
          <li key={o.id} className="flex flex-wrap justify-between gap-2 px-4 py-2">
            <span>
              {o.requestedBy} · {o.description}
              <span className="block text-xs text-gray-500">
                {o.status} · {o.department}
              </span>
            </span>
            <span className="font-medium text-brown">₦{o.amount.toLocaleString()}</span>
          </li>
        ))}
        {pendingOutflows.length === 0 && <li className="px-4 py-3 text-gray-500">No pending outflows</li>}
      </ul>
      <div className="border-t border-gray-200 px-4 py-2">
        <a href="/outflow" className="text-sm font-semibold text-brown underline">
          Open outflow →
        </a>
      </div>
    </section>
  );
}