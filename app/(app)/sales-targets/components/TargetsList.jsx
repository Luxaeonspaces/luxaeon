import { prisma } from "@/lib/prisma";
import SubmitButton from "@/app/components/SubmitButton";
import { updateAchievement } from "../actions";

export default async function TargetsList({ userId, perms }) {
  const allTargets =
    perms.isFounder || perms.isHeadOfSales
      ? await prisma.salesTarget.findMany({ orderBy: { createdAt: "desc" }, take: 40 })
      : await prisma.salesTarget.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });

  // Leads won attributed to each marketer
  const leadCounts = await prisma.lead.groupBy({
    by: ["ownerUserId"],
    where: { status: "Won", ownerUserId: { not: null } },
    _count: true,
  });
  const leadMap = {};
  for (const l of leadCounts) {
    if (l.ownerUserId) leadMap[l.ownerUserId] = l._count;
  }

  return (
    <div className="space-y-4">
      {allTargets.map((t) => {
        const finPct = t.targetAmount > 0 ? Math.min(100, Math.round((t.achievedAmount / t.targetAmount) * 100)) : 0;
        const leadPct = t.leadsTarget > 0 ? Math.min(100, Math.round((t.leadsAchieved / t.leadsTarget) * 100)) : 0;
        const wonLeads = leadMap[t.userId] || 0;
        return (
          <div key={t.id} className="glass-card space-y-4 p-5">
            <p className="font-semibold text-brown">
              {t.employeeName} · {t.period}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-300 bg-white/60 p-4">
                <p className="text-xs uppercase text-gray-500">Finance / revenue</p>
                <p className="text-lg font-bold text-brown">
                  ₦{t.achievedAmount.toLocaleString()} / ₦{t.targetAmount.toLocaleString()}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-whitesmoke">
                  <div className="h-full rounded-full bg-brown" style={{ width: `${finPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{finPct}% of revenue target</p>
              </div>
              <div className="rounded-xl border border-gray-300 bg-white/60 p-4">
                <p className="text-xs uppercase text-gray-500">Leads</p>
                <p className="text-lg font-bold text-brown">
                  {t.leadsAchieved} / {t.leadsTarget}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-whitesmoke">
                  <div className="h-full rounded-full bg-brown" style={{ width: `${leadPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {leadPct}% · Won clients attributed: {wonLeads}
                </p>
              </div>
            </div>
            <form action={updateAchievement} className="grid items-end gap-2 md:grid-cols-4">
              <input type="hidden" name="id" value={t.id} />
              <label className="text-xs">
                Revenue achieved (₦)
                <input name="achievedAmount" type="number" className="input" defaultValue={t.achievedAmount} />
              </label>
              <label className="text-xs">
                Leads achieved
                <input name="leadsAchieved" type="number" className="input" defaultValue={t.leadsAchieved} />
              </label>
              <label className="flex items-center gap-2 pb-2 text-xs">
                <input type="checkbox" name="postFinance" />
                Also post revenue increase to Finance (avoid if already from project payment)
              </label>
              <SubmitButton className="btn-primary" pendingText="Updating...">
                Update progress
              </SubmitButton>
            </form>
          </div>
        );
      })}
      {allTargets.length === 0 && <p className="text-gray-500">No targets yet</p>}
    </div>
  );
}