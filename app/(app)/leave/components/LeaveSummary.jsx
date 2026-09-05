import {
  getMyLeaves,
  calculateLeaveBalance,
  MAX_DAYS,
} from "./leave-data";

export default async function LeaveSummary({ userId }) {
  const year = new Date().getFullYear();

  const leaves = await getMyLeaves(userId);

  const { used, balance } = calculateLeaveBalance(
    leaves,
    year
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="glass-card p-4 text-center">
        <div className="text-xs uppercase text-gray-500">
          Annual entitlement
        </div>

        <div className="font-display text-2xl font-bold text-burgundy">
          {MAX_DAYS}
        </div>
      </div>

      <div className="glass-card p-4 text-center">
        <div className="text-xs uppercase text-gray-500">
          Used / pending ({year})
        </div>

        <div className="font-display text-2xl font-bold text-burgundy">
          {used}
        </div>
      </div>

      <div className="glass-card p-4 text-center">
        <div className="text-xs uppercase text-gray-500">
          Balance
        </div>

        <div className="font-display text-2xl font-bold text-burgundy">
          {balance}
        </div>
      </div>
    </div>
  );
}