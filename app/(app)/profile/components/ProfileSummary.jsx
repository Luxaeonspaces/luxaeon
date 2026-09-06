import { prisma } from "@/lib/prisma";

export default async function ProfileSummary({ user }) {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

  return (
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
          {profile.salaryAmount > 0 && (
            <p>
              <strong>Basic salary:</strong> ₦{profile.salaryAmount.toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500">No HR profile on file yet — ping HR to complete it</p>
      )}
    </div>
  );
}