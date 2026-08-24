import AmountInput from "@/components/AmountInput";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { setTarget, updateAchievement } from "./actions";

export default async function SalesTargetsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();
  if (!perms.canManageSalesTargets) redirect("/dashboard");

  const salesStaff = await prisma.user.findMany({
    where: {
      active: true,
      OR: [
        { department: "Sales & Marketing" },
        { department: "Sales" },
        { department: "Marketing" },
      ],
    },
    orderBy: { fullName: "asc" },
  });

  const allTargets =
    perms.isFounder || perms.isHeadOfSales
      ? await prisma.salesTarget.findMany({ orderBy: { createdAt: "desc" }, take: 40 })
      : await prisma.salesTarget.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 });

  // Leads won attributed to each marketer
  const leadCounts = await prisma.lead.groupBy({
    by: ["ownerUserId"],
    where: { status: "Won", ownerUserId: { not: null } },
    _count: true,
  });
  const leadMap: Record<string, number> = {};
  for (const l of leadCounts) {
    if (l.ownerUserId) leadMap[l.ownerUserId] = l._count;
  }

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Sales Targets</h1>
        <p className="relative z-10 text-sm text-white/80">
          Finance progress and leads progress tracked separately · client matched to marketer
        </p>
      </div>

      {(perms.canSetSalesTargets || perms.isFounder) && (
        <form key={searchParams?.ok || "target"} action={setTarget} className="glass-card grid gap-3 p-5 md:grid-cols-2">
          <h2 className="md:col-span-2 font-semibold text-burgundy">Set target</h2>
          <select name="userId" className="input" required>
            {salesStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <input name="period" className="input" placeholder="Period e.g. August 2026" required />
          <div><AmountInput name="targetAmount" placeholder="Revenue target (₦)" required /></div>
          <input name="leadsTarget" type="number" className="input" placeholder="Leads target" />
          <button type="submit" className="btn-primary md:col-span-2">
            Save target
          </button>
        </form>
      )}

      <div className="space-y-4">
        {allTargets.map((t) => {
          const finPct = t.targetAmount > 0 ? Math.min(100, Math.round((t.achievedAmount / t.targetAmount) * 100)) : 0;
          const leadPct = t.leadsTarget > 0 ? Math.min(100, Math.round((t.leadsAchieved / t.leadsTarget) * 100)) : 0;
          const wonLeads = leadMap[t.userId] || 0;
          return (
            <div key={t.id} className="glass-card p-5 space-y-4">
              <p className="font-semibold text-burgundy">
                {t.employeeName} · {t.period}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gold/40 bg-white/60 p-4">
                  <p className="text-xs uppercase text-gray-500">Finance / revenue</p>
                  <p className="text-lg font-bold text-burgundy">
                    ₦{t.achievedAmount.toLocaleString()} / ₦{t.targetAmount.toLocaleString()}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
                    <div className="h-full rounded-full bg-burgundy" style={{ width: `${finPct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{finPct}% of revenue target</p>
                </div>
                <div className="rounded-xl border border-gold/40 bg-white/60 p-4">
                  <p className="text-xs uppercase text-gray-500">Leads</p>
                  <p className="text-lg font-bold text-burgundy">
                    {t.leadsAchieved} / {t.leadsTarget}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${leadPct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {leadPct}% · Won clients attributed: {wonLeads}
                  </p>
                </div>
              </div>
              <form action={updateAchievement} className="grid gap-2 md:grid-cols-4 items-end">
                <input type="hidden" name="id" value={t.id} />
                <label className="text-xs">
                  Revenue achieved (₦)
                  <input name="achievedAmount" type="number" className="input" defaultValue={t.achievedAmount} />
                </label>
                <label className="text-xs">
                  Leads achieved
                  <input name="leadsAchieved" type="number" className="input" defaultValue={t.leadsAchieved} />
                </label>
                <label className="flex items-center gap-2 text-xs pb-2">
                  <input type="checkbox" name="postFinance" />
                  Also post revenue increase to Finance (avoid if already from project payment)
                </label>
                <button type="submit" className="btn-primary">
                  Update progress
                </button>
              </form>
            </div>
          );
        })}
        {allTargets.length === 0 && <p className="text-gray-500">No targets yet</p>}
      </div>
    </div>
  );
}
