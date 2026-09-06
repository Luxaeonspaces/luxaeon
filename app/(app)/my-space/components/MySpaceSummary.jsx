import {
  getPayrolls,
  getMyLeaves,
  calculateLeaveUsage,
} from "./my-space-data";

const MAX_DAYS = 60;

export default async function MySpaceSummary({ user }) {
  const year = new Date().getFullYear();

  const [payrolls, leaves] = await Promise.all([
    getPayrolls(user.id),
    getMyLeaves(user.id),
  ]);

  const used = calculateLeaveUsage(
    leaves,
    year
  );

  const latestPayroll = payrolls[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="glass-card p-4">
        <p className="text-xs uppercase text-gray-500">
          Role
        </p>

        <p className="font-semibold text-burgundy">
          {user.role} · {user.department || "—"}
        </p>
      </div>

      <div className="glass-card p-4">
        <p className="text-xs uppercase text-gray-500">
          Leave balance {year}
        </p>

        <p className="font-semibold text-burgundy">
          {MAX_DAYS - used} of {MAX_DAYS} days left
        </p>
      </div>

      <div className="glass-card p-4">
        <p className="text-xs uppercase text-gray-500">
          Latest net pay
        </p>

        <p className="font-semibold text-burgundy">
          {latestPayroll
            ? `₦${latestPayroll.netPay.toLocaleString()} · ${latestPayroll.period}`
            : "—"}
        </p>
      </div>
    </div>
  );
}