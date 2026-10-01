import { requireUser } from "@/lib/session";

import LeaveHeader from "./components/LeaveHeader";
import LeaveMessages from "./components/LeaveMessages";
import LeaveRequestForm from "./components/LeaveRequestForm";
import LeaveSummary from "./components/LeaveSummary";
import MyLeaveHistory from "./components/MyLeaveHistory";
import TeamLeaveSection from "./components/TeamLeaveSection";

export default async function LeavePage({
  searchParams,
}) {
  const { user, perms } = await requireUser();

  const params = await searchParams;

  const showTeam =
    perms.isFounder ||
    perms.isHod ||
    perms.canManageHr;

  return (
    <div className="space-y-6">
      <LeaveHeader />

      <LeaveMessages
        error={params?.error}
        ok={params?.ok}
      />

      <LeaveSummary userId={user.id} />

      <LeaveRequestForm
        message={params?.ok || params?.error}
      />

      <MyLeaveHistory userId={user.id} />

      {showTeam && (
        <TeamLeaveSection
          user={user}
          perms={perms}
        />
      )}
    </div>
  );
}