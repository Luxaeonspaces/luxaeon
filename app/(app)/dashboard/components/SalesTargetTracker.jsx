import { prisma } from "@/lib/prisma";

export default async function SalesTargetTracker({ userId }) {
  let salesTargets = [];
  try {
    salesTargets = await prisma.salesTarget.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch {
    salesTargets = [];
  }

  return (
    <section className="glass-card space-y-4 p-5">
      <h2 className="font-display font-semibold text-brown">Your sales target tracker</h2>
      {salesTargets.length === 0 && (
        <p className="text-sm text-gray-500">No targets yet — set under Sales Targets.</p>
      )}
      {salesTargets.map((st) => {
        const pct = st.targetAmount > 0 ? Math.min(100, Math.round((st.achievedAmount / st.targetAmount) * 100)) : 0;
        return (
          <div key={st.id}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{st.period}</span>
              <span>
                NGN {st.achievedAmount.toLocaleString()} / {st.targetAmount.toLocaleString()} ({pct}%)
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-whitesmoke">
              <div className="h-full rounded-full bg-brown" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leads {st.leadsAchieved}/{st.leadsTarget}
            </p>
          </div>
        );
      })}
      <a href="/sales-targets" className="text-sm font-semibold text-brown underline">
        Open full target tracker
      </a>
    </section>
  );
}