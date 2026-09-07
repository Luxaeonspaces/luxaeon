import ProjectPaymentsTable from "./ProjectPaymentsTable";
import ProjectPaymentEditForm from "./ProjectPaymentEditForm";
import ProjectNewPaymentForm from "./ProjectNewPaymentForm";

export default function ProjectPayments({
  project,
  paymentTxns,
  paidFromHistory,
  balance,
  canEditActive,
  editProjectPaymentAction,
  recordProjectPaymentAction,
  formKey,
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brown/30 px-4 py-3">
        <h2 className="font-semibold text-brown">Payment history &amp; balance</h2>
        <div className="text-sm">
          Balance due: <strong className="text-brown">₦{balance.toLocaleString()}</strong>
        </div>
      </div>

      <div className="grid gap-3 border-b border-brown/20 p-4 sm:grid-cols-3 text-center text-sm">
        <div>
          <div className="text-xs uppercase text-gray-500">Design fee</div>
          <div className="font-semibold">₦{(project.designFee || 0).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500">Total paid</div>
          <div className="font-semibold">₦{(project.amountPaid || 0).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500">From payment log</div>
          <div className="font-semibold">₦{paidFromHistory.toLocaleString()}</div>
        </div>
      </div>

      <ProjectPaymentsTable paymentTxns={paymentTxns} />

      <div className="space-y-3 border-t border-brown/30 p-4">
        {canEditActive &&
          paymentTxns.map((p) => (
            <ProjectPaymentEditForm key={`edit-${p.id}`} payment={p} editProjectPaymentAction={editProjectPaymentAction} />
          ))}
      </div>

      {canEditActive && (
        <ProjectNewPaymentForm recordProjectPaymentAction={recordProjectPaymentAction} formKey={formKey} />
      )}
    </div>
  );
}