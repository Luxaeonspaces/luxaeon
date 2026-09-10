import SubmitButton from "@/app/components/SubmitButton";
import OutflowCard from "./OutflowCard";

export default function FinanceReleaseSection({ rows, releaseFundsAction, cardActions }) {
  return (
    <section className="glass-card p-5">
      <h2 className="mb-3 font-display font-semibold text-brown">Head of Finance — fund release</h2>
      {rows.map((r) => (
        <OutflowCard key={r.id} r={r} canUpload={false} canEdit={r.status === "Pending Department"} actions={cardActions}>
          <form action={releaseFundsAction} className="mt-2 flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="note" className="input flex-1" placeholder="Disbursement note" />
            <SubmitButton name="decision" value="release" className="btn-primary" pendingText="Releasing funds...">
              Release funds
            </SubmitButton>
            <SubmitButton name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700" pendingText="Rejecting...">
              Reject
            </SubmitButton>
          </form>
        </OutflowCard>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-500">None pending</p>}
    </section>
  );
}