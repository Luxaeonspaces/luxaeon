import { Suspense } from "react";
import { requireUser } from "@/lib/session";

import MySpaceHeader from "./components/MySpaceHeader";
import MySpaceMessages from "./components/MySpaceMessages";
import MySpaceSummary from "./components/MySpaceSummary";
import MySpaceSummarySkeleton from "./components/MySpaceSummarySkeleton";
import EmployeeProfile from "./components/EmployeeProfile";
import EmployeeProfileSkeleton from "./components/EmployeeProfileSkeleton";
import LeaveSection from "./components/LeaveSection";
import LeaveSectionSkeleton from "./components/LeaveSectionSkeleton";
import PayrollSection from "./components/PayrollSection";
import PayrollSectionSkeleton from "./components/PayrollSectionSkeleton";

export default async function MySpacePage({
  searchParams,
}: {
  searchParams?: {
    ok?: string;
    error?: string;
  };
}) {
  const { user } = await requireUser();

  return (
    <div className="space-y-6">
      <MySpaceHeader />

      <MySpaceMessages
        error={searchParams?.error}
        ok={searchParams?.ok}
      />

      <Suspense fallback={<MySpaceSummarySkeleton />}>
        <MySpaceSummary user={user} />
      </Suspense>

      <Suspense fallback={<EmployeeProfileSkeleton />}>
        <EmployeeProfile user={user} />
      </Suspense>

      <Suspense fallback={<LeaveSectionSkeleton />}>
        <LeaveSection
          userId={user.id}
          message={searchParams?.ok}
        />
      </Suspense>

      <Suspense fallback={<PayrollSectionSkeleton />}>
        <PayrollSection userId={user.id} />
      </Suspense>
    </div>
  );
}