import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ProfilePage() {
  const { user, perms } = await requireUser();
  const profile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  const payrolls = await prisma.payrollRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

    let leaveUsed = 0;
  try {
    const year = new Date().getFullYear();
    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: user.id, year, status: { in: ["Approved", "Pending HOD", "Pending HR"] } },
    });
    leaveUsed = leaves.reduce((a, l) => a + l.days, 0);
  } catch {}

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">My Profile & Payslip</h1>
      </div>
      <div className="glass-card space-y-2 p-5 text-sm">
        <p>
          <strong>Name:</strong> {user.fullName}
        </p>
        <p>
          <strong>Role:</strong> {user.role} · {user.department || "—"}
        </p>
        {profile ? (
          <>
            <p>
              <strong>Job title:</strong> {profile.jobTitle || "—"}
            </p>
            <p>
              <strong>Employee ID:</strong> {profile.employeeId || "—"}
            </p>
            {(perms.canManageHr || perms.isFounder || true) && profile.salaryAmount > 0 && (
              <p>
                <strong>Basic salary:</strong> ₦{profile.salaryAmount.toLocaleString()}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-500">No HR profile on file yet — ping HR to complete it</p>
        )}
      </div>
      <div className="glass-card overflow-hidden">
        <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">Payslips</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Net</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => (
              <tr key={p.id} className="border-t border-gold/20">
                <td className="px-4 py-2">{p.period}</td>
                <td className="px-4 py-2">₦{p.netPay.toLocaleString()}</td>
                <td className="px-4 py-2">{p.status}</td>
              </tr>
            ))}
            {payrolls.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                  No payslips yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
