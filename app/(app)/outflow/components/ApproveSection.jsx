import OutflowCard from "./OutflowCard";

export default function ApproveSection({ title, rows, decisionAction, cardActions, approveLabel = "Approve" }) {
  return (
    <section className="glass-card p-5">
      <h2 className="mb-3 font-display font-semibold text-brown">{title}</h2>
      {rows.map((r) => (
        <OutflowCard key={r.id} r={r} canUpload={false} canEdit={r.status === "Pending Department"} actions={cardActions}>
          <form action={decisionAction} className="mt-2 flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="note" className="input flex-1" placeholder="Note" />
            <button type="submit" name="decision" value="approve" data-submit-trigger="true" className="btn-primary">
              {approveLabel}
            </button>
            <button type="submit" name="decision" value="reject" data-submit-trigger="true" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">
              Reject
            </button>
          </form>
        </OutflowCard>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-500">None pending</p>}
    </section>
  );
}