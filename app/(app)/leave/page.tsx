import { requireUser } from "@/lib/session";

import LeaveHeader from "./components/LeaveHeader";
import LeaveMessages from "./components/LeaveMessages";
import LeaveRequestForm from "./components/LeaveRequestForm";
import LeaveSummary from "./components/LeaveSummary";
import MyLeaveHistory from "./components/MyLeaveHistory";
import TeamLeaveSection from "./components/TeamLeaveSection";

type LeavePageProps = {
  searchParams?: {
    error?: string;
    ok?: string;
  };
};

export default async function LeavePage({
  searchParams,
}: LeavePageProps) {
  const { user, perms } = await requireUser();

  const showTeam =
    perms.isFounder ||
    perms.isHod ||
    perms.canManageHr;

  return (
    <div className="space-y-6">
      <LeaveHeader />

      <LeaveMessages
        error={searchParams?.error}
        ok={searchParams?.ok}
      />

      <LeaveSummary userId={user.id} />

      <LeaveRequestForm
        message={
          searchParams?.ok ||
          searchParams?.error
        }
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