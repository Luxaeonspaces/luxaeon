import { getTeamLeaves } from "./leave-data";
import {
  HodApprovalCard,
  HrApprovalCard,
} from "./LeaveApprovalCard";
import LeaveTable from "./LeaveTable";

export default async function TeamLeaveSection({
  user,
  perms,
}) {
  const team = await getTeamLeaves({
    user,
    perms,
  });

  const showHod =
    perms.isFounder || perms.isHod;

  const showHr =
    perms.canManageHr || perms.isFounder;

  const pendingHod = team.filter(
    (leave) => leave.status === "Pending HOD"
  );

  const pendingHr = team.filter(
    (leave) => leave.status === "Pending HR"
  );

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-burgundy">
        Team leave (visible to maker&apos;s HOD, HR, Founder)
      </h2>

      {showHod &&
        pendingHod.map((leave) => (
          <HodApprovalCard
            key={leave.id}
            leave={leave}
          />
        ))}

      {showHr &&
        pendingHr.map((leave) => (
          <HrApprovalCard
            key={leave.id}
            leave={leave}
          />
        ))}

      <div className="glass-card p-5">
        <LeaveTable rows={team} />
      </div>
    </div>
  );
}