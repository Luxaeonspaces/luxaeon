import { founderApproveAppraisal } from "../actions";

export default function FounderQueueSection({ pendingFounder }) {
  if (pendingFounder.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-brown">3. Founder final approval</h2>
      {pendingFounder.map((a) => (
        <div key={a.id} className="glass-card p-4 text-sm space-y-2">
          <p className="font-semibold">
            {a.employeeName} · {a.period} · HR overall {a.overallScore}/5 (self {a.selfOverall}/5)
          </p>
          <p className="text-xs text-gray-500">HR reviewer: {a.hrReviewer}</p>
          {(a.selfSalesTarget || a.selfSalesAchieved) && (
            <p>
              Sales ₦{(a.selfSalesAchieved || 0).toLocaleString()} / ₦{(a.selfSalesTarget || 0).toLocaleString()}
            </p>
          )}
          <form action={founderApproveAppraisal} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={a.id} />
            <input name="founderNote" className="input flex-1" placeholder="Founder note" />
            <button name="decision" value="approve" className="btn-primary">
              Approve
            </button>
            <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-red-700">
              Reject
            </button>
          </form>
        </div>
      ))}
    </section>
  );
}