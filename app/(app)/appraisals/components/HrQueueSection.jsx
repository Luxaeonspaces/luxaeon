import { hrApproveAppraisal } from "../actions";

const HR_SCORES = [
  ["qualityScore", "Quality"],
  ["teamworkScore", "Teamwork"],
  ["reliabilityScore", "Reliability"],
  ["initiativeScore", "Initiative"],
  ["communicationScore", "Comm"],
];

export default function HrQueueSection({ pendingHr }) {
  if (pendingHr.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-brown">2. HR review queue</h2>
      {pendingHr.map((a) => (
        <div key={a.id} className="glass-card p-4 text-sm space-y-2">
          <p className="font-semibold">
            {a.employeeName} · {a.period} · Self overall {a.selfOverall}/5
          </p>
          <p className="text-xs text-gray-500">
            Self: Q{a.selfQuality} T{a.selfTeamwork} R{a.selfReliability} I{a.selfInitiative} C{a.selfCommunication}
          </p>
          <p>KPIs: {a.selfKpis || "—"}</p>
          {(a.selfSalesTarget || a.selfSalesAchieved) && (
            <p className="text-brown">
              Sales target ₦{(a.selfSalesTarget || 0).toLocaleString()} · Achieved ₦
              {(a.selfSalesAchieved || 0).toLocaleString()}
            </p>
          )}
          <form action={hrApproveAppraisal} className="grid gap-2 md:grid-cols-5">
            <input type="hidden" name="id" value={a.id} />
            {HR_SCORES.map(([n, l]) => (
              <label key={n} className="text-xs">
                {l}
                <input name={n} type="number" min={1} max={5} defaultValue={3} className="input" required />
              </label>
            ))}
            <textarea name="strengths" className="input md:col-span-5" rows={1} placeholder="HR strengths note" />
            <textarea name="improvements" className="input md:col-span-5" rows={1} placeholder="HR improvements" />
            <textarea name="hrNote" className="input md:col-span-5" rows={1} placeholder="HR note to Founder" />
            <button type="submit" className="btn-primary md:col-span-5">
              HR approve → send to Founder
            </button>
          </form>
        </div>
      ))}
    </section>
  );
}