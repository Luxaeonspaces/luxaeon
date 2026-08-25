import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

const matrix = [
  ["View dashboard", "Yes", "Yes", "Yes"],
  ["Create / manage leads", "Yes", "Yes", "Yes"],
  ["Create projects", "Yes", "HOD / Design / IT", "Design staff"],
  ["Edit project details (fees/stage)", "Yes", "HOD + Finance staff", "No"],
  ["View Finance & Cashflow", "Yes", "Finance dept", "No"],
  ["Disburse funds / pay payroll", "No", "Head of Finance only", "No"],
  ["Request outflow (expense)", "Yes", "Yes", "Yes"],
  ["Approve outflow (department step)", "Yes", "Own dept HOD", "No"],
  ["Approve outflow (founder step)", "Yes", "No", "No"],
  ["Release outflow funds", "No", "Head of Finance only", "No"],
  ["Process procurement", "Yes", "Procurement dept", "No"],
  ["Sales targets", "Yes", "Sales HOD set / Sales view", "Sales only"],
  ["Appraisals manage", "Yes", "HR", "Self + acknowledge"],
  ["HOD appraisal approve", "Yes", "Own dept HOD", "No"],
  ["HR / payroll generate", "Yes", "HR", "No"],
  ["Payroll founder approve", "Yes", "No", "No"],
  ["Reports (finance/login/project)", "Yes", "All HODs", "No — “can’t access data”"],
  ["User management", "Yes", "IT department", "No"],
  ["Team activity feed", "Yes", "No", "No"],
];

export default async function PermissionsPage() {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Role-based access control</h1>
        <p className="relative z-10 text-sm text-white/80">Permission matrix + expense approval workflow</p>
      </div>

      <div className="glass-card space-y-3 p-5 text-sm">
        <h2 className="font-display font-semibold text-burgundy">Expense (outflow) approval workflow</h2>
        <ol className="list-decimal space-y-2 pl-5 text-gray-700">
          <li>
            <strong>Maker (any staff)</strong> — creates outflow request with amount, payee bank details, optional
            project link, and supporting documents. Status: <code>Pending Department</code>
          </li>
          <li>
            <strong>Head of Department</strong> — reviews only requests for <em>their department</em>. Approve →{" "}
            <code>Pending Founder</code> · Reject → <code>Rejected</code>
          </li>
          <li>
            <strong>Founder</strong> — final policy approval. Approve → <code>Pending Finance</code> · Reject →{" "}
            <code>Rejected</code>. Founder does <em>not</em> disburse money.
          </li>
          <li>
            <strong>Head of Finance only</strong> — releases funds. Posts one <strong>Expense</strong> transaction
            (unique Txn ID) into Finance &amp; Cashflow. Status: <code>Disbursed</code>
          </li>
        </ol>
        <p className="text-xs text-gray-500">
          Payroll uses the same money control idea: HR prepares batch → Founder approves → Head of Finance disburses
          one cumulative expense.
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">Permission matrix</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Capability</th>
              <th className="px-4 py-2">Founder</th>
              <th className="px-4 py-2">Department Head / special</th>
              <th className="px-4 py-2">Staff</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((r) => (
              <tr key={r[0]} className="border-t border-gold/20">
                {r.map((c) => (
                  <td key={c} className="px-4 py-2 align-top">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card p-5 text-sm">
        <p className="font-semibold text-burgundy">Your live session flags</p>
        <pre className="mt-2 overflow-auto rounded-xl bg-cream/80 p-3 text-xs">
          {JSON.stringify(
            {
              user: user.fullName,
              role: user.role,
              department: user.department,
              ...Object.fromEntries(
                Object.entries(perms).filter(([k]) => k.startsWith("can") || k.startsWith("is"))
              ),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
