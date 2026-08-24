import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { preparePayroll, founderApproveBatch, disburseBatch } from "./actions";
import AmountInput from "@/components/AmountInput";

export default async function PayrollPage({
  searchParams,
}: {
  searchParams?: { ok?: string; error?: string };
}) {
  const { user, perms } = await requireUser();
  if (!perms.canManageHr && !perms.canSeeFinance && !perms.isFounder) redirect("/dashboard");

  const batches = await prisma.payrollBatch.findMany({
    include: { records: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Payroll</h1>
        <p className="relative z-10 text-sm text-white/80">
          HR generates → <strong>Founder approves</strong> → <strong>Head of Finance only</strong> disburses (one transaction)
        </p>
      </div>

      {searchParams?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.ok && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{searchParams.ok}</p>}

      <div className="flex flex-wrap gap-2">
        <a
          href="/api/export/payroll?all=1"
          className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-burgundy"
        >
          Download all payroll (Excel)
        </a>
      </div>

      {perms.canManageHr && (
        <form action={preparePayroll} className="glass-card grid gap-3 p-5 md:grid-cols-3" key={searchParams?.ok || "pay"}>
          <h2 className="md:col-span-3 font-semibold text-burgundy">Generate payroll batch</h2>
          <input name="period" className="input" placeholder="Period e.g. August 2026" required />
          <div>
            <AmountInput name="allowances" placeholder="Default allowances (₦)" />
          </div>
          <div>
            <AmountInput name="deductions" placeholder="Default deductions (₦)" />
          </div>
          <button type="submit" className="btn-primary md:col-span-3">
            Generate &amp; send to Founder
          </button>
          <p className="md:col-span-3 text-xs text-gray-500">
            Creates one batch with all salaried staff. Cumulative total posts once when Finance disburses.
          </p>
        </form>
      )}

      {batches.map((b) => (
        <div key={b.id} className="glass-card space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-burgundy">
                {b.period} · {b.employeeCount} staff · Total ₦{b.totalNet.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Status: {b.status} · Prepared by {b.preparedBy}
                {b.founderApprovedBy ? ` · Founder: ${b.founderApprovedBy}` : ""}
                {b.linkedTxnId ? ` · Txn ${b.linkedTxnId}` : ""}
              </p>
            </div>
            <a
              href={`/api/export/payroll?batchId=${b.id}`}
              className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-sm font-semibold text-burgundy"
            >
              Download batch (Excel)
            </a>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-1">Employee</th>
                <th className="py-1">Basic</th>
                <th className="py-1">Net</th>
              </tr>
            </thead>
            <tbody>
              {b.records.map((r) => (
                <tr key={r.id} className="border-t border-gold/20">
                  <td className="py-1">{r.employeeName}</td>
                  <td className="py-1">₦{r.basicSalary.toLocaleString()}</td>
                  <td className="py-1">₦{r.netPay.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {perms.isFounder && b.status === "Pending Founder" && (
            <form action={founderApproveBatch} className="flex gap-2">
              <input type="hidden" name="id" value={b.id} />
              <button name="decision" value="approve" className="btn-primary">
                Founder approve → Finance
              </button>
              <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">
                Reject
              </button>
            </form>
          )}
          {perms.canDisburseFunds && b.status === "Approved" && (
            <form action={disburseBatch}>
              <input type="hidden" name="id" value={b.id} />
              <button className="btn-primary">Disburse cumulative payroll (Head of Finance only)</button>
            </form>
          )}
        </div>
      ))}
      {batches.length === 0 && <p className="text-gray-500">No payroll batches yet</p>}
    </div>
  );
}
