import { getMyLeaves } from "./leave-data";
import LeaveTable from "./LeaveTable";

export default async function MyLeaveHistory({ userId }) {
  const leaves = await getMyLeaves(userId);

  return (
    <div className="glass-card p-5">
      <h2 className="mb-2 font-semibold text-burgundy">
        My leave history
      </h2>

      <LeaveTable rows={leaves} />
    </div>
  );
}