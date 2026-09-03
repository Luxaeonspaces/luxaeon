import { PROJECT_STAGES } from "@/lib/rbac";
import AmountInput from "@/components/AmountInput";

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}

export default function ProjectDetailsForm({ project, canEditActive, isLocked, updateProjectDetailsAction }) {
  return (
    <>
      <div className="glass-card grid gap-3 p-5 text-sm md:grid-cols-2">
        <h2 className="md:col-span-2 font-display text-lg font-semibold text-brown">All project details</h2>
        <Detail label="Client" value={project.clientName} />
        <Detail label="Sales owner" value={project.salesPersonName || "—"} />
        <Detail label="Location" value={project.location || "—"} />
        <Detail label="Status" value={project.status} />
        <Detail label="Created by" value={project.createdBy || "—"} />
        <Detail label="Access code" value={project.clientAccessCode || "—"} />
      </div>

      {canEditActive ? (
        <form action={updateProjectDetailsAction} className="glass-card grid gap-3 p-5 md:grid-cols-2">
          <h2 className="md:col-span-2 font-display font-semibold text-brown">Update project (Finance / HOD / Founder)</h2>
          <select name="stage" className="input" defaultValue={project.stage}>
            {PROJECT_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select name="status" className="input" defaultValue={project.status}>
            {["Active", "On Hold", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div>
            <span className="text-xs text-gray-500">Design fee</span>
            <AmountInput name="designFee" defaultValue={project.designFee} />
          </div>
          <div>
            <span className="text-xs text-gray-500">Amount paid</span>
            <AmountInput name="amountPaid" defaultValue={project.amountPaid} />
          </div>
          <input name="location" className="input" defaultValue={project.location || ""} placeholder="Location" />
          <input name="targetHandover" className="input" defaultValue={project.targetHandover || ""} placeholder="Target handover" />
          <textarea name="notes" className="input md:col-span-2" rows={2} defaultValue={project.notes || ""} placeholder="Notes" />
          <button type="submit" className="btn-primary md:col-span-2">
            Save changes
          </button>
        </form>
      ) : isLocked ? (
        <p className="rounded-xl border border-brown/40 bg-brown/10 px-4 py-3 text-sm text-brown">
          Project is completed and locked. View and download only — see Project Archives for exports.
        </p>
      ) : (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Unfortunately you cannot edit project details. Only Finance staff, Heads of Department, and Founder can edit.
        </p>
      )}
    </>
  );
}