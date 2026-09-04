import { prisma } from "@/lib/prisma";
import { submitSelfAppraisal } from "../actions";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const yearNow = new Date().getFullYear();

export default async function SelfAppraisalForm({ userId, isSales, formKey }) {
  const myTargets = isSales
    ? await prisma.salesTarget.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  return (
    <form key={formKey} action={submitSelfAppraisal} className="glass-card grid gap-3 p-5 md:grid-cols-3">
      <h2 className="md:col-span-3 font-semibold text-brown">1. My self-appraisal &amp; KPIs</h2>
      <select name="year" className="input" defaultValue={yearNow}>
        {[yearNow - 1, yearNow, yearNow + 1].map((y) => (
          <option key={y}>{y}</option>
        ))}
      </select>
      <select name="quarter" className="input" defaultValue={`Q${Math.ceil((new Date().getMonth() + 1) / 3)}`}>
        {QUARTERS.map((q) => (
          <option key={q}>{q}</option>
        ))}
      </select>
      <div />
      {[
        ["selfQuality", "Quality (self)"],
        ["selfTeamwork", "Teamwork (self)"],
        ["selfReliability", "Reliability (self)"],
        ["selfInitiative", "Initiative (self)"],
        ["selfCommunication", "Communication (self)"],
      ].map(([name, label]) => (
        <label key={name} className="text-sm">
          <span className="text-xs text-gray-500">{label} 1–5</span>
          <input name={name} type="number" min={1} max={5} defaultValue={3} className="input" required />
        </label>
      ))}
      <textarea
        name="selfKpis"
        className="input md:col-span-3"
        rows={2}
        placeholder="Your KPIs for this quarter (what you commit to deliver)"
        required
      />
      <textarea name="selfStrengths" className="input md:col-span-3" rows={2} placeholder="Strengths this quarter" />
      <textarea name="selfImprovements" className="input md:col-span-3" rows={2} placeholder="Areas to improve" />
      <textarea name="selfGoals" className="input md:col-span-3" rows={2} placeholder="Goals next quarter" />

      {isSales && (
        <>
          <p className="md:col-span-3 text-sm text-brown font-medium">
            Sales &amp; Marketing — financial target is part of your appraisal
          </p>
          <input
            name="selfSalesTarget"
            type="number"
            className="input"
            placeholder="Sales target (₦)"
            defaultValue={myTargets[0]?.targetAmount || ""}
          />
          <input
            name="selfSalesAchieved"
            type="number"
            className="input"
            placeholder="Sales achieved (₦)"
            defaultValue={myTargets[0]?.achievedAmount || ""}
          />
          <p className="text-xs text-gray-500 self-center">
            Latest target period: {myTargets[0]?.period || "none set yet"}
          </p>
        </>
      )}
      <button type="submit" className="btn-primary md:col-span-3">
        Submit self-appraisal to HR
      </button>
    </form>
  );
}