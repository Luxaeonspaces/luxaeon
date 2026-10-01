import {
  getAllLeaveBalances,
  getMyLeaves,
} from "./leave-data";

export default async function LeaveSummary({ userId }) {
  const year = new Date().getFullYear();

  const leaves = await getMyLeaves(userId);

  const balances = getAllLeaveBalances(
    leaves,
    year
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((leave) => (
        <div
          key={leave.key}
          className="glass-card p-4"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-burgundy">
                {leave.label}
              </div>

              <div className="text-xs text-gray-500">
                {year}
              </div>
            </div>

            <div className="text-right">
              <div className="font-display text-xl font-bold text-burgundy">
                {leave.balance}
              </div>

              <div className="text-xs text-gray-500">
                remaining
              </div>
            </div>
          </div>

          <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-burgundy"
              style={{
                width: `${Math.min(
                  100,
                  (leave.used / leave.maxDays) * 100
                )}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>
              Used: {leave.used}
            </span>

            <span>
              Entitlement: {leave.maxDays}
            </span>
          </div>

          {leave.requiresDocument && (
            <div className="mt-2 text-xs text-gray-500">
              Supporting document required
            </div>
          )}
        </div>
      ))}
    </div>
  );
}