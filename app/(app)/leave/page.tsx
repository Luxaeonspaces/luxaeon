import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { requestLeave, hodApproveLeave, hrApproveLeave } from "./actions";

const MAX = 60;

export default async function LeavePage({
  searchParams,
}: {
  searchParams?: { ok?: string; error?: string };
}) {
  const { user, perms } = await requireUser();
  const year = new Date().getFullYear();

  const myLeaves = await prisma.leaveRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const used = myLeaves
    .filter((l) => l.year === year && ["Approved", "Pending HOD", "Pending HR"].includes(l.status))
    .reduce((a, l) => a + l.days, 0);
  const balance = MAX - used;

  // Visibility: own + (HOD same dept) + HR + Founder
  let team: typeof myLeaves = [];
  if (perms.isFounder || perms.canManageHr) {
    team = await prisma.leaveRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  } else if (perms.isHod && user.department) {
    team = await prisma.leaveRequest.findMany({
      where: { department: user.department },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Leave requests</h1>
        <p className="relative z-10 text-sm text-white/85">
          Max {MAX} days/year · continuous deduction · HOD → HR approval
        </p>
      </div>

      {searchParams?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.ok && (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-burgundy">{searchParams.ok}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Annual entitlement</div>
          <div className="font-display text-2xl font-bold text-burgundy">{MAX}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Used / pending ({year})</div>
          <div className="font-display text-2xl font-bold text-burgundy">{used}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Balance</div>
          <div className="font-display text-2xl font-bold text-burgundy">{balance}</div>
        </div>
      </div>

      <form action={requestLeave} className="glass-card grid gap-3 p-5 md:grid-cols-2" key={searchParams?.ok || "l"}>
        <h2 className="md:col-span-2 font-semibold text-burgundy">Request leave</h2>
        <label className="text-sm">
          <span className="text-xs text-gray-500">Start</span>
          <input name="startDate" type="date" className="input" required />
        </label>
        <label className="text-sm">
          <span className="text-xs text-gray-500">End</span>
          <input name="endDate" type="date" className="input" required />
        </label>
        <textarea name="reason" className="input md:col-span-2" rows={2} placeholder="Reason" />
        <button type="submit" className="btn-primary md:col-span-2">
          Submit to Head of Department
        </button>
      </form>

      <div className="glass-card p-5">
        <h2 className="mb-2 font-semibold text-burgundy">My leave history</h2>
        <LeaveTable rows={myLeaves} />
      </div>

      {(perms.isHod || perms.canManageHr || perms.isFounder) && (
        <div className="space-y-3">
          <h2 className="font-semibold text-burgundy">Team leave (visible to maker&apos;s HOD, HR, Founder)</h2>
          {team
            .filter((l) => l.status === "Pending HOD" && (perms.isFounder || perms.isHod))
            .map((l) => (
              <form key={l.id} action={hodApproveLeave} className="glass-card flex flex-wrap gap-2 p-4 text-sm">
                <input type="hidden" name="id" value={l.id} />
                <p className="w-full">
                  <strong>{l.employeeName}</strong> · {l.startDate} → {l.endDate} ({l.days} days) · {l.department}
                </p>
                <input name="note" className="input flex-1" placeholder="HOD note" />
                <button name="decision" value="approve" className="btn-primary">
                  Approve → HR
                </button>
                <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-red-700">
                  Reject
                </button>
              </form>
            ))}
          {(perms.canManageHr || perms.isFounder) &&
            team
              .filter((l) => l.status === "Pending HR")
              .map((l) => (
                <form key={l.id} action={hrApproveLeave} className="glass-card flex flex-wrap gap-2 p-4 text-sm">
                  <input type="hidden" name="id" value={l.id} />
                  <p className="w-full">
                    <strong>{l.employeeName}</strong> · {l.startDate} → {l.endDate} ({l.days}d) · HOD: {l.hodApprovedBy}
                  </p>
                  <input name="note" className="input flex-1" placeholder="HR note" />
                  <button name="decision" value="approve" className="btn-primary">
                    HR approve
                  </button>
                  <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-red-700">
                    Reject
                  </button>
                </form>
              ))}
          <div className="glass-card p-5">
            <LeaveTable rows={team} />
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveTable({ rows }: { rows: any[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs uppercase text-gray-500">
        <tr>
          <th className="py-1">Employee</th>
          <th className="py-1">Dates</th>
          <th className="py-1">Days</th>
          <th className="py-1">Status</th>
          <th className="py-1">Approvals</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l) => (
          <tr key={l.id} className="border-t border-gold/20">
            <td className="py-1">{l.employeeName}</td>
            <td className="py-1">
              {l.startDate} → {l.endDate}
            </td>
            <td className="py-1">{l.days}</td>
            <td className="py-1">{l.status}</td>
            <td className="py-1 text-xs">
              HOD: {l.hodApprovedBy || "—"} · HR: {l.hrApprovedBy || "—"}
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={5} className="py-4 text-center text-gray-500">
              No leave records
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
