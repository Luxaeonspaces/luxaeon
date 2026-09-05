import { prisma } from "@/lib/prisma";

export default async function FounderOutflowsTable() {
  const outflows = await prisma.outflowRequest.findMany({ orderBy: { requestDate: "desc" }, take: 10 });
  if (outflows.length === 0) return null;

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 font-display font-semibold text-brown">
        Outflow Requests (Founder view)
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">By</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Dept / Final</th>
            </tr>
          </thead>
          <tbody>
            {outflows.map((o) => (
              <tr key={o.id} className="border-t border-gray-200">
                <td className="px-4 py-2">{o.requestedBy}</td>
                <td className="px-4 py-2">{o.description}</td>
                <td className="px-4 py-2">₦{o.amount.toLocaleString()}</td>
                <td className="px-4 py-2">{o.status}</td>
                <td className="px-4 py-2 text-xs text-gray-600">
                  {o.deptApprovedBy || "—"} / {o.finalApprovedBy || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}