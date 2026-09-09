import { founderApproveAppraisal } from "../actions";
import DecisionButtons from "@/app/components/DecisionButtons";

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
            <DecisionButtons />
          </form>
        </div>
      ))}
    </section>
  );
}