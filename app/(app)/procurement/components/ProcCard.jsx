import DocList from "@/components/DocList";
import ProcDocsUpload from "@/components/ProcDocsUpload";
import { editProcurement, cancelProcurement, recallProcurement, resubmitProcurement } from "../actions";

export default function ProcCard({ r, canUpload, canEdit }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white/60 p-3 text-sm">
      <p className="font-semibold text-brown">{r.title}</p>
      <p className="text-xs text-gray-500">
        {r.requestedBy} · {r.department} · {r.projectCode || "No project"} · ₦{(r.estimatedCost || 0).toLocaleString()} ·{" "}
        <strong>{r.status}</strong>
      </p>
      {r.description && <p className="mt-1 text-gray-600">{r.description}</p>}
      <div className="mt-2 rounded-lg bg-whitesmoke p-2 text-xs">
        <p className="font-semibold text-brown">Approval levels</p>
        <p>
          1. Procurement HOD: {r.hodApprovedBy || "Pending"} {r.hodNote ? `· ${r.hodNote}` : ""}
        </p>
        <p>
          2. Founder: {r.founderApprovedBy || "Pending"} {r.founderNote ? `· ${r.founderNote}` : ""}
        </p>
        <p>
          3. Head of Finance: {r.financeReleasedBy || "Pending"} {r.linkedTxnId ? `· ${r.linkedTxnId}` : ""}
        </p>
      </div>
      <DocList
        docs={(r.documents || []).map((d) => ({
          id: d.id,
          name: d.originalName || d.filename,
          filename: d.filename,
          by: d.uploadedBy,
          href: `/api/files/procurement/${d.filename}`,
        }))}
      />
      {canUpload && <ProcDocsUpload procurementId={r.id} />}
      {["Pending Procurement HOD", "Pending Founder", "Pending Finance"].includes(r.status) && (
        <div className="mt-2 space-y-2 border-t border-gray-200 pt-2">
          <form action={recallProcurement} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="reason" className="input flex-1" placeholder="Reason for recall (optional)" />
            <button type="submit" className="rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              Recall (send to previous level)
            </button>
          </form>
          <form action={cancelProcurement} className="flex flex-wrap gap-2">
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
          <form action={resubmitProcurement}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="btn-primary text-xs">
              Resubmit to Procurement HOD
            </button>
          </form>
          <form action={cancelProcurement}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">
              Cancel (void)
            </button>
          </form>
        </div>
      )}
      {canEdit && (r.status === "Pending Procurement HOD" || r.status === "Recalled") && (
        <form action={editProcurement} className="mt-3 grid gap-2 border-t border-gray-200 pt-3 md:grid-cols-2">
          <p className="md:col-span-2 text-xs font-semibold text-brown">Edit before Procurement HOD approval</p>
          <input type="hidden" name="id" value={r.id} />
          <input name="title" className="input md:col-span-2" defaultValue={r.title} required />
          <input name="estimatedCost" className="input" defaultValue={r.estimatedCost} />
          <input name="category" className="input" defaultValue={r.category || ""} />
          <input name="projectCode" className="input" defaultValue={r.projectCode || ""} />
          <input name="vendorPreferred" className="input" defaultValue={r.vendorPreferred || ""} />
          <input name="payeeName" className="input" defaultValue={r.payeeName || ""} />
          <input name="payeeBankName" className="input" defaultValue={r.payeeBankName || ""} />
          <input name="payeeAccountNo" className="input" defaultValue={r.payeeAccountNo || ""} />
          <textarea name="description" className="input md:col-span-2" defaultValue={r.description || ""} rows={2} />
          <button type="submit" className="btn-primary md:col-span-2">
            Save changes
          </button>
        </form>
      )}
    </div>
  );
}