import { Suspense } from "react";
import { requireUser } from "@/lib/session";

import MySpaceHeader from "./components/MySpaceHeader";
import MySpaceSummary from "./components/MySpaceSummary";
import MySpaceSummarySkeleton from "./components/MySpaceSummarySkeleton";
import EmployeeProfile from "./components/EmployeeProfile";
import EmployeeProfileSkeleton from "./components/EmployeeProfileSkeleton";
import LeaveSection from "./components/LeaveSection";
import LeaveSectionSkeleton from "./components/LeaveSectionSkeleton";
import PayrollSection from "./components/PayrollSection";
import PayrollSectionSkeleton from "./components/PayrollSectionSkeleton";
import LeaveRequestForm from "../leave/components/LeaveRequestForm";
import SelfAppraisalForm from "../appraisals/components/SelfAppraisalForm";
import AppraisalQueuesAndHistory from "../appraisals/components/AppraisalQueuesAndHistory";

function FormSkeleton() {
  return <div className="glass-card h-40 animate-pulse" />;
}


function QueueSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card h-24 animate-pulse p-4" />
      ))}
    </div>
  );
}

export default async function MySpacePage({
  searchParams,
}: {
  searchParams?: {
    ok?: string;
    error?: string;
  };
}) {
  const { user, perms } = await requireUser();

  return (
    <div className="space-y-6">
      <MySpaceHeader />

      <Suspense fallback={<MySpaceSummarySkeleton />}>
        <MySpaceSummary user={user} />

      </Suspense>

      <Suspense fallback={<EmployeeProfileSkeleton />}>
        <EmployeeProfile user={user} />
      </Suspense>

       <Suspense fallback={<FormSkeleton />}>
              <SelfAppraisalForm userId={user.id} isSales={perms.isSales} formKey={searchParams?.ok || "appraisal"} />
            </Suspense>
      <Suspense fallback={<LeaveSectionSkeleton />}>
       <LeaveRequestForm
        message={
          searchParams?.ok ||
          searchParams?.error
        }
      />
      </Suspense>

         <Suspense fallback={<QueueSkeleton />}>
              <AppraisalQueuesAndHistory userId={user.id} department={user.department} perms={perms} />
            </Suspense>

      <Suspense fallback={<PayrollSectionSkeleton />}>
        <PayrollSection userId={user.id} />
      </Suspense>

    </div>
  );
}