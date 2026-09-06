export default function OutflowWorkflowExplainer() {
  return (
    <div className="glass-card space-y-3 p-5 text-sm">
      <h2 className="font-display font-semibold text-brown">Expense (outflow) approval workflow</h2>
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
  );
}