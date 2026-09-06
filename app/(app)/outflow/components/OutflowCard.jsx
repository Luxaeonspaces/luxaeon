import OutflowDocs from "@/components/OutflowDocs";


export default function OutflowCard({ r, canUpload, canEdit, actions, children }) {
  const { editOutflowAction, recallOutflowAction, cancelOutflowAction, resubmitOutflowAction } = actions;

  return (
    <div className="mb-3 rounded-xl border border-gray-200 bg-white/50 p-3 text-sm">
      <p>
        <strong>{r.requestedBy}</strong> · ₦{r.amount.toLocaleString()} · {r.description}
      </p>
      <p className="text-xs text-gray-500">
        Status: {r.status} · Payee: {r.payeeName || "—"} · {r.payeeBankName} {r.payeeAccountNo}
      </p>
      <div className="mt-2 rounded-lg bg-whitesmoke p-2 text-xs text-gray-600">
        <p className="font-semibold text-brown">Approval levels</p>
        <p>
          1. Dept HOD: {r.deptApprovedBy ? `${r.deptApprovedBy} (${r.deptDate?.slice(0, 10) || "—"})` : "Pending"}{" "}
          {r.deptNote ? `· ${r.deptNote}` : ""}
        </p>
        <p>
          2. Founder: {r.finalApprovedBy ? `${r.finalApprovedBy} (${r.finalDate?.slice(0, 10) || "—"})` : "Pending"}{" "}
          {r.finalNote ? `· ${r.finalNote}` : ""}
        </p>
        <p>
          3. Head of Finance:{" "}
          {r.financeReleasedBy
            ? `${r.financeReleasedBy} (${r.financeDate?.slice(0, 10) || "—"}) · ${r.linkedTxnId || ""}`
            : "Pending disbursement"}
        </p>
      </div>
      <OutflowDocs
        outflowId={r.id}
        docs={(r.documents || []).map((d) => ({
          id: d.id,
          name: d.originalName || d.filename,
          filename: d.filename,
          by: d.uploadedBy,
        }))}
        canUpload={canUpload}
      />
      {canEdit && (r.status === "Pending Department" || r.status === "Recalled") && (
        <form action={editOutflowAction} className="mt-3 grid gap-2 border-t border-gray-200 pt-3 md:grid-cols-2">
          <p className="md:col-span-2 text-xs font-semibold text-brown">Edit request (before HOD approval)</p>
          <input type="hidden" name="id" value={r.id} />
          <input name="description" className="input md:col-span-2" defaultValue={r.description} required />
          <input name="amount" className="input" defaultValue={r.amount} />
          <input name="category" className="input" defaultValue={r.category || ""} />
          <input name="vendor" className="input" defaultValue={r.vendor || ""} />
          <input name="projectCode" className="input" defaultValue={r.projectCode || ""} />
          <input name="payeeName" className="input" defaultValue={r.payeeName || ""} />
          <input name="payeeBankName" className="input" defaultValue={r.payeeBankName || ""} />
          <input name="payeeAccountName" className="input" defaultValue={r.payeeAccountName || ""} />
          <input name="payeeAccountNo" className="input" defaultValue={r.payeeAccountNo || ""} />
          <button type="submit" className="btn-primary md:col-span-2">
            Save changes
          </button>
        </form>
      )}
      {["Pending Department", "Pending Founder", "Pending Finance"].includes(r.status) && (
        <div className="mt-2 space-y-2 border-t border-gray-200 pt-2">
          <form action={recallOutflowAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="reason" className="input flex-1" placeholder="Reason for recall (optional)" />
            <button type="submit" className="rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              Recall (send to previous level)
            </button>
          </form>
          <form action={cancelOutflowAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="reason" className="input flex-1" placeholder="Reason to void voucher (optional)" />
            <button type="submit" className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">
              Cancel (void requisition)
            </button>
          </form>
        </div>
      )}
      {r.status === "Recalled" && (
        <div className="mt-2 flex flex-wrap gap-2 border-t border-gray-200 pt-2">
          <form action={resubmitOutflowAction}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="btn-primary text-xs">
              Resubmit to department HOD
            </button>
          </form>
          <form action={cancelOutflowAction}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">
              Cancel (void)
            </button>
          </form>
        </div>
      )}
      {children}
    </div>
  );
}