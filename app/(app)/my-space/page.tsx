import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Link from "next/link";
import { requestLeave } from "../leave/actions";

const MAX = 60;

export default async function MySpacePage({
  searchParams,
}: {
  searchParams?: { ok?: string; error?: string };
}) {
  const { user } = await requireUser();
  const year = new Date().getFullYear();

  const profile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  const payrolls = await prisma.payrollRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const used = leaves
    .filter((l) => l.year === year && ["Approved", "Pending HOD", "Pending HR"].includes(l.status))
    .reduce((a, l) => a + l.days, 0);

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">My employee space</h1>
        <p className="relative z-10 text-sm text-white/85">
          Your profile, leave &amp; payroll — view only (edits are done by HR)
        </p>
      </div>

      {searchParams?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.ok && (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-burgundy">{searchParams.ok}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-4">
          <p className="text-xs uppercase text-gray-500">Role</p>
          <p className="font-semibold text-burgundy">
            {user.role} · {user.department || "—"}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs uppercase text-gray-500">Leave balance {year}</p>
          <p className="font-semibold text-burgundy">
            {MAX - used} of {MAX} days left
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs uppercase text-gray-500">Latest net pay</p>
          <p className="font-semibold text-burgundy">
            {payrolls[0] ? `₦${payrolls[0].netPay.toLocaleString()} · ${payrolls[0].period}` : "—"}
          </p>
        </div>
      </div>

      {/* Profile — read only */}
      <section className="glass-card p-5">
        <h2 className="mb-3 font-display font-semibold text-burgundy">My documented profile</h2>
        <p className="mb-3 text-xs text-gray-500">Read-only · contact HR to update personal records</p>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <RO label="Full name" value={user.fullName} />
          <RO label="Username" value={user.username} />
          <RO label="Employee ID" value={profile?.employeeId} />
          <RO label="Job title" value={profile?.jobTitle} />
          <RO label="Phone" value={profile?.phone} />
          <RO label="Email" value={profile?.email} />
          <RO label="Date joined" value={profile?.dateJoined} />
          <RO label="Date of birth" value={profile?.dateOfBirth} />
          <RO label="Address" value={profile?.address} />
          <RO label="Next of kin" value={profile?.nokName ? `${profile.nokName} (${profile.nokRelationship || "—"}) ${profile.nokPhone || ""}` : undefined} />
          <RO label="Bank" value={profile?.bankName ? `${profile.bankName} · ${profile.bankAccount || ""}` : undefined} />
          <RO label="Skills" value={profile?.skills} />
        </div>
      </section>

      {/* Leave request from dashboard */}
      <section className="glass-card p-5">
        <h2 className="mb-3 font-display font-semibold text-burgundy">Request leave</h2>
        <form key={searchParams?.ok || "leave-ms"} action={requestLeave} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="returnTo" value="/my-space" />
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
            Submit leave (to your HOD)
          </button>
        </form>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-1">Dates</th>
                <th className="py-1">Days</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.slice(0, 8).map((l) => (
                <tr key={l.id} className="border-t border-gold/20">
                  <td className="py-1">
                    {l.startDate} → {l.endDate}
                  </td>
                  <td className="py-1">{l.days}</td>
                  <td className="py-1">{l.status}</td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-gray-500">
                    No leave yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Link href="/leave" className="mt-2 inline-block text-sm text-burgundy underline">
          Full leave page →
        </Link>
      </section>

      {/* Payroll read-only */}
      <section className="glass-card overflow-hidden">
        <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">My payroll (view only)</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Basic</th>
              <th className="px-4 py-2">Net</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => (
              <tr key={p.id} className="border-t border-gold/20">
                <td className="px-4 py-2">{p.period}</td>
                <td className="px-4 py-2">₦{p.basicSalary.toLocaleString()}</td>
                <td className="px-4 py-2">₦{p.netPay.toLocaleString()}</td>
                <td className="px-4 py-2">{p.status}</td>
              </tr>
            ))}
            {payrolls.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No payslips yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function RO({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-gold/20 bg-white/50 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value || "—"}</div>
    </div>
  );
}
