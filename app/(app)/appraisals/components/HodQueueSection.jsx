import { hodApproveAppraisal } from "../actions";
import DecisionButtons from "@/app/components/DecisionButtons";

export default function HodQueueSection({ pendingHod }) {
  if (pendingHod.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-brown">1b. Head of Department review</h2>
      {pendingHod.map((a) => (
        <div key={a.id} className="glass-card p-4 text-sm space-y-2">
          <p className="font-semibold">
            {a.employeeName} · {a.period} · Self {a.selfOverall}/5 · {a.department}
          </p>
          <p>KPIs: {a.selfKpis || "—"}</p>
          <form action={hodApproveAppraisal} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={a.id} />
            <input name="note" className="input flex-1" placeholder="HOD note" />
            <DecisionButtons approveLabel="Approve → HR" />
          </form>
        </div>
      ))}
    </section>
  );
}