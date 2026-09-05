import { prisma } from "@/lib/prisma";
import Metric from "./Metric";

export default async function MetricsSection({ perms }) {
  const [leads, active, paid, pending, income, expense] = await Promise.all([
    prisma.lead.count(),
    prisma.project.count({ where: { status: "Active" } }),
    prisma.project.aggregate({ _sum: { amountPaid: true } }),
    prisma.outflowRequest.count({
      where: { status: { in: ["Pending Department", "Pending Founder"] } },
    }),
    prisma.transaction.aggregate({ where: { type: "Income" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "Expense" }, _sum: { amount: true } }),
  ]);

  const feeTotal = paid._sum.amountPaid || 0;
  const inc = income._sum.amount || 0;
  const exp = expense._sum.amount || 0;

  return (
    <>
      <div className={`grid gap-4 ${perms.canSeeFees ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <Metric label="Leads" value={String(leads)} />
        <Metric label="Active Projects" value={String(active)} />
        {perms.canSeeFees && <Metric label="Fees Collected" value={`₦${feeTotal.toLocaleString()}`} />}
        <Metric label="Pending Approvals" value={String(pending)} />
      </div>

      {perms.canSeeFinance && (
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Income" value={`₦${inc.toLocaleString()}`} />
          <Metric label="Expenses" value={`₦${exp.toLocaleString()}`} />
          <Metric label="Net" value={`₦${(inc - exp).toLocaleString()}`} />
        </div>
      )}

      {!perms.canSeeFees && (
        <p className="text-sm text-gray-500">
          Department view — fee figures are visible only to Finance and Founder.
        </p>
      )}
    </>
  );
}