import { founderApproveBatch, disburseBatch } from "../actions";

export default function BatchCard({ b, perms }) {
  return (
    <div className="glass-card space-y-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-brown">
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
          className="rounded-xl border border-gray-300 bg-whitesmoke px-3 py-2 text-sm font-semibold text-brown"
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
            <tr key={r.id} className="border-t border-gray-200">
              <td className="py-1">{r.employeeName}</td>
              <td className="py-1">₦{r.basicSalary.toLocaleString()}</td>
              <td className="py-1">₦{r.netPay.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {perms.isFounder && b.status === "Pending Founder" && (
        <form action={founderApproveBatch} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={b.id} />
          <button type="submit" name="decision" value="approve" data-submit-trigger="true" className="btn-primary">
            Founder approve → Finance
          </button>
          <button type="submit" name="decision" value="reject" data-submit-trigger="true" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">
            Reject
          </button>
        </form>
      )}
      {perms.canDisburseFunds && b.status === "Approved" && (
        <form action={disburseBatch}>
          <input type="hidden" name="id" value={b.id} />
          <button type="submit" data-submit-trigger="true" className="btn-primary">Disburse cumulative payroll (Head of Finance only)</button>
        </form>
      )}
    </div>
  );
}