import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const { user, perms } = await requireUser();
  let salesTargets: any[] = [];
  if (perms.isSales) {
    try {
      salesTargets = await prisma.salesTarget.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      });
    } catch {
      salesTargets = [];
    }
  }
  const first = user.fullName.split(" ")[0] || user.fullName;

  const [leads, active, paid, pending, income, expense] = await Promise.all([
    prisma.lead.count(),
    prisma.project.count({ where: { status: "Active" } }),
    prisma.project.aggregate({ _sum: { amountPaid: true } }),
    prisma.outflowRequest.count({
      where: { status: { in: ["Pending Department", "Pending Founder"] } },
    }),
    prisma.transaction.aggregate({ where: { type: "Income" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "Expense" }, _sum: { amount: true } }),
  ]);

  const feeTotal = paid._sum.amountPaid || 0;
  const inc = income._sum.amount || 0;
  const exp = expense._sum.amount || 0;

  const projects = await prisma.project.findMany({
    where: { status: "Active" },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  const stageGroups = await prisma.project.groupBy({
    by: ["stage"],
    where: { status: "Active" },
    _count: true,
  });

  const pendingOutflows = await prisma.outflowRequest.findMany({
    where: {
      status: { in: ["Pending Department", "Pending Founder", "Pending Finance"] },
      ...(perms.isFounder
        ? {}
        : perms.isHod && user.department
          ? { department: user.department }
          : { requestedById: user.id }),
    },
    orderBy: { requestDate: "desc" },
    take: 8,
  });

  const outflows = perms.isFounder
    ? await prisma.outflowRequest.findMany({ orderBy: { requestDate: "desc" }, take: 10 })
    : [];

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Hey {first} 👋</h1>
        <p className="relative z-10 mt-1 text-sm text-white/85">
          {user.role}
          {user.department ? ` · ${user.department}` : ""} · here is your snapshot
        </p>
      </div>

      <div className={`grid gap-4 ${perms.canSeeFees ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <Metric label="Leads" value={String(leads)} />
        <Metric label="Active Projects" value={String(active)} />
        {perms.canSeeFees && <Metric label="Fees Collected" value={`₦${feeTotal.toLocaleString()}`} />}
        <Metric label="Pending Approvals" value={String(pending)} />
      </div>

      {perms.canSeeFinance && (
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Income" value={`₦${inc.toLocaleString()}`} />
          <Metric label="Expenses" value={`₦${exp.toLocaleString()}`} />
          <Metric label="Net" value={`₦${(inc - exp).toLocaleString()}`} />
        </div>
      )}

      {!perms.canSeeFees && (
        <p className="text-sm text-gray-500">
          Department view — fee figures are visible only to Finance and Founder.
        </p>
      )}

      <section className="glass-card p-5">
        <h2 className="mb-3 font-display font-semibold text-burgundy">Project stages (live)</h2>
        <div className="flex flex-wrap gap-2">
          {stageGroups.map((g) => (
            <span key={g.stage} className="rounded-full bg-burgundy/10 px-3 py-1 text-xs font-medium text-burgundy">
              {g.stage}: {g._count}
            </span>
          ))}
          {stageGroups.length === 0 && <span className="text-sm text-gray-500">No active projects</span>}
        </div>
      </section>

      {(perms.isFounder || perms.isHod || pendingOutflows.length > 0) && (
        <section className="glass-card overflow-hidden">
          <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">
            Pending outflow approvals {perms.isFounder ? "(all depts)" : perms.isHod ? `(${user.department})` : "(yours)"}
          </div>
          <ul className="divide-y divide-gold/20 text-sm">
            {pendingOutflows.map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-2 px-4 py-2">
                <span>
                  {o.requestedBy} · {o.description}
                  <span className="block text-xs text-gray-500">{o.status} · {o.department}</span>
                </span>
                <span className="font-medium text-burgundy">₦{o.amount.toLocaleString()}</span>
              </li>
            ))}
            {pendingOutflows.length === 0 && (
              <li className="px-4 py-3 text-gray-500">No pending outflows</li>
            )}
          </ul>
          <div className="border-t border-gold/20 px-4 py-2">
            <a href="/outflow" className="text-sm font-semibold text-burgundy underline">Open outflow →</a>
          </div>
        </section>
      )}

      {perms.isSales && (
        <section className="glass-card space-y-4 p-5">
          <h2 className="font-display font-semibold text-burgundy">Your sales target tracker</h2>
          {salesTargets.length === 0 && (
            <p className="text-sm text-gray-500">No targets yet — set under Sales Targets.</p>
          )}
          {salesTargets.map((st) => {
            const pct =
              st.targetAmount > 0
                ? Math.min(100, Math.round((st.achievedAmount / st.targetAmount) * 100))
                : 0;
            return (
              <div key={st.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{st.period}</span>
                  <span>
                    NGN {st.achievedAmount.toLocaleString()} / {st.targetAmount.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream">
                  <div className="h-full rounded-full bg-burgundy" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Leads {st.leadsAchieved}/{st.leadsTarget}
                </p>
              </div>
            );
          })}
          <a href="/sales-targets" className="text-sm font-semibold text-burgundy underline">
            Open full target tracker
          </a>
        </section>
      )}

      <section className="glass-card overflow-hidden">
        <div className="border-b border-gold/30 px-4 py-3 font-display font-semibold text-burgundy">
          Active Projects
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Stage</th>
                <th className="px-4 py-2">Created by</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-gold/20">
                  <td className="px-4 py-2 font-medium">{p.projectCode}</td>
                  <td className="px-4 py-2">{p.clientName}</td>
                  <td className="px-4 py-2">{p.stage}</td>
                  <td className="px-4 py-2 text-gray-600">{p.createdBy || "—"}</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No projects yet — create your first one
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {perms.isFounder && outflows.length > 0 && (
        <section className="glass-card overflow-hidden">
          <div className="border-b border-gold/30 px-4 py-3 font-display font-semibold text-burgundy">
            Outflow Requests (Founder view)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream/50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">By</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Dept / Final</th>
                </tr>
              </thead>
              <tbody>
                {outflows.map((o) => (
                  <tr key={o.id} className="border-t border-gold/20">
                    <td className="px-4 py-2">{o.requestedBy}</td>
                    <td className="px-4 py-2">{o.description}</td>
                    <td className="px-4 py-2">₦{o.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">{o.status}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {o.deptApprovedBy || "—"} / {o.finalApprovedBy || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4 text-center transition hover:-translate-y-1">
      <div className="font-display text-2xl font-bold tracking-tight text-burgundy">{value}</div>
      <div className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}
