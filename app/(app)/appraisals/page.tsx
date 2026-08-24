import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { submitSelfAppraisal, hrApproveAppraisal, founderApproveAppraisal, hodApproveAppraisal } from "./actions";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const yearNow = new Date().getFullYear();

export default async function AppraisalsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();
  const isSales = perms.isSales;

  const myTargets = isSales
    ? await prisma.salesTarget.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  let appraisals;
  if (perms.canManageAppraisals || perms.isFounder) {
    appraisals = await prisma.appraisal.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  } else if (perms.isHod) {
    // HOD views all in their department (and can approve queue)
    appraisals = await prisma.appraisal.findMany({
      where: {
        OR: [{ department: user.department || undefined }, { userId: user.id }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } else {
    appraisals = await prisma.appraisal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  }

  const pendingHod = appraisals.filter((a) => a.status === "Self Submitted");
  const pendingHr = appraisals.filter((a) => a.status === "HOD Approved");
  const pendingFounder = appraisals.filter((a) => a.status === "HR Approved");

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Appraisals (Quarterly)</h1>
        <p className="relative z-10 text-sm text-white/80">
          Flow: Self → Head of Dept → HR → Founder
        </p>
      </div>

      {/* Employee self appraisal */}
      <form key={searchParams?.ok || "appraisal"} action={submitSelfAppraisal} className="glass-card grid gap-3 p-5 md:grid-cols-3">
        <h2 className="md:col-span-3 font-semibold text-burgundy">1. My self-appraisal &amp; KPIs</h2>
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
            <p className="md:col-span-3 text-sm text-burgundy font-medium">
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

      {/* HOD queue */}
      {perms.canHodApproveAppraisal && pendingHod.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-burgundy">1b. Head of Department review</h2>
          {pendingHod.map((a) => (
            <div key={a.id} className="glass-card p-4 text-sm space-y-2">
              <p className="font-semibold">{a.employeeName} · {a.period} · Self {a.selfOverall}/5 · {a.department}</p>
              <p>KPIs: {a.selfKpis || "—"}</p>
              <form action={hodApproveAppraisal} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={a.id} />
                <input name="note" className="input flex-1" placeholder="HOD note" />
                <button name="decision" value="approve" className="btn-primary">Approve → HR</button>
                <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-red-700">Reject</button>
              </form>
            </div>
          ))}
        </section>
      )}

      {/* HR queue */}
      {perms.canManageAppraisals && pendingHr.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-burgundy">2. HR review queue</h2>
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
                <p className="text-burgundy">
                  Sales target ₦{(a.selfSalesTarget || 0).toLocaleString()} · Achieved ₦
                  {(a.selfSalesAchieved || 0).toLocaleString()}
                </p>
              )}
              <form action={hrApproveAppraisal} className="grid gap-2 md:grid-cols-5">
                <input type="hidden" name="id" value={a.id} />
                {[
                  ["qualityScore", "Quality"],
                  ["teamworkScore", "Teamwork"],
                  ["reliabilityScore", "Reliability"],
                  ["initiativeScore", "Initiative"],
                  ["communicationScore", "Comm"],
                ].map(([n, l]) => (
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
      )}

      {/* Founder */}
      {perms.isFounder && pendingFounder.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-burgundy">3. Founder final approval</h2>
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
      )}

      {/* History */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">Appraisal history</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Self</th>
              <th className="px-4 py-2">HR</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {appraisals.map((a) => (
              <tr key={a.id} className="border-t border-gold/20">
                <td className="px-4 py-2">{a.employeeName}</td>
                <td className="px-4 py-2">{a.period}</td>
                <td className="px-4 py-2">{a.selfOverall || "—"}</td>
                <td className="px-4 py-2">{a.overallScore || "—"}</td>
                <td className="px-4 py-2">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
