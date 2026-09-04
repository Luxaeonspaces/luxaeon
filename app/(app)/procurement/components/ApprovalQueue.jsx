import ProcCard from "./ProcCard";

export default function ApprovalQueue({ title, rows, action, finance, canUpload }) {
  return (
    <section className="glass-card space-y-3 p-5">
      <h2 className="font-display font-semibold text-brown">{title}</h2>
      {rows.map((r) => (
        <div key={r.id}>
          <ProcCard r={r} canUpload={canUpload} canEdit={r.status === "Pending Procurement HOD"} />
          <form action={action} className="mt-2 flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="note" className="input flex-1" placeholder="Note" />
            <button name="decision" value={finance ? "release" : "approve"} className="btn-primary">
              {finance ? "Disburse funds" : "Approve"}
            </button>
            <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">
              Reject
            </button>
          </form>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-500">None pending</p>}
    </section>
  );
}