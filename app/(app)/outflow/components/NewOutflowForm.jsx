import { DEPARTMENTS } from "@/lib/rbac";
import AmountInput from "@/app/components/AmountInput";
import OutflowDocs from "@/app/components/OutflowDocs";

export default function NewOutflowForm({ user, createOutflowAction, createdId, formKey }) {
  return (
    <>
      <form key={formKey} action={createOutflowAction} className="glass-card grid gap-3 p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 font-semibold text-brown">New request (Maker)</h2>
        <p className="md:col-span-2 text-sm text-gray-500">Requested by: {user.fullName}</p>
        <select name="department" className="input" defaultValue={user.department || "General"}>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <input name="category" className="input" placeholder="Category" defaultValue="Materials" />
        <input name="description" className="input md:col-span-2" placeholder="Description *" required />
        <div>
          <AmountInput name="amount" placeholder="Amount (₦) *" required />
        </div>
        <input name="vendor" className="input" placeholder="Vendor" />
        <input name="projectCode" className="input" placeholder="Project code (optional)" />
        <input name="payeeName" className="input" placeholder="Payee name" />
        <input name="payeeBankName" className="input" placeholder="Bank name" />
        <input name="payeeAccountName" className="input" placeholder="Account name" />
        <input name="payeeAccountNo" className="input" placeholder="Account number" />
        <button type="submit" data-submit-trigger="true" className="btn-primary md:col-span-2">
          Submit for department review
        </button>
        <p className="md:col-span-2 text-xs text-gray-500">
          After submit, upload supporting documents on the request card (or below if just created).
        </p>
      </form>

      {createdId && (
        <div className="glass-card p-4">
          <p className="mb-2 text-sm font-semibold text-brown">Upload supporting docs for this request</p>
          <OutflowDocs outflowId={createdId} docs={[]} canUpload />
        </div>
      )}
    </>
  );
}