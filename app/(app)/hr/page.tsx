import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { preparePayroll } from "./actions";

export default async function HrPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();
  if (!perms.canManageHr) redirect("/dashboard");

  const staff = await prisma.user.findMany({
    where: { active: true },
    include: { profile: true, hrDocuments: true },
    orderBy: { fullName: "asc" },
  });
  const payrolls = await prisma.payrollRecord.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  const allLeaves = await prisma.leaveRequest.findMany({ orderBy: { createdAt: "desc" }, take: 80 });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">HR & Payroll</h1>
        <p className="relative z-10 text-sm text-white/80">Employee profiles · documents · payroll</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href="/api/hr/export?all=1&format=csv" className="btn-primary">
          Download all staff (Excel/CSV)
        </a>
        <a
          href="/api/hr/export?all=1&format=pdf"
          className="rounded-xl border border-gold/50 bg-white/80 px-4 py-2.5 text-sm font-semibold text-burgundy"
        >
          Download all staff (PDF)
        </a>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role / Dept</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Salary</th>
              <th className="px-4 py-2">Docs</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-gold/20">
                <td className="px-4 py-2 font-medium">{s.fullName}</td>
                <td className="px-4 py-2">
                  {s.role} · {s.department}
                </td>
                <td className="px-4 py-2">{s.profile?.jobTitle || "—"}</td>
                <td className="px-4 py-2">₦{(s.profile?.salaryAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-2">{s.hrDocuments.length}</td>
                <td className="px-4 py-2">
                  <a href={`/hr/${s.id}`} className="font-semibold text-burgundy underline">
                    Open profile
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-600">
        Open each employee profile to edit personal details, next of kin, spouse, guarantor, health, education, skills, and
        upload documents.
      </p>

      <form key={searchParams?.ok || "payroll"} action={preparePayroll} className="glass-card space-y-3 p-5">
        <h2 className="font-semibold text-burgundy">Prepare draft payroll</h2>
        <input name="period" className="input" placeholder="Period e.g. August 2026" required />
        <button type="submit" className="btn-primary">
          Generate draft for all active staff
        </button>
        <p className="text-xs text-gray-500">Prepared by {user.fullName}</p>
      </form>

      <div className="glass-card overflow-hidden">
        <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">Leave history (all staff — Head of HR / HR)</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Dept</th>
              <th className="px-4 py-2">Dates</th>
              <th className="px-4 py-2">Days</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Approvals</th>
            </tr>
          </thead>
          <tbody>
            {allLeaves.map((l) => (
              <tr key={l.id} className="border-t border-gold/20">
                <td className="px-4 py-2">{l.employeeName}</td>
                <td className="px-4 py-2">{l.department || "—"}</td>
                <td className="px-4 py-2">{l.startDate} → {l.endDate}</td>
                <td className="px-4 py-2">{l.days}</td>
                <td className="px-4 py-2">{l.status}</td>
                <td className="px-4 py-2 text-xs">HOD: {l.hodApprovedBy || "—"} · HR: {l.hrApprovedBy || "—"}</td>
              </tr>
            ))}
            {allLeaves.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No leave records</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/30 px-4 py-3">
          <span className="font-semibold text-burgundy">Recent payroll</span>
          <a href="/api/export/payroll" className="text-sm font-semibold text-burgundy underline">
            Download payroll Excel
          </a>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Net</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => (
              <tr key={p.id} className="border-t border-gold/20">
                <td className="px-4 py-2">{p.employeeName}</td>
                <td className="px-4 py-2">{p.period}</td>
                <td className="px-4 py-2">₦{p.netPay.toLocaleString()}</td>
                <td className="px-4 py-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
