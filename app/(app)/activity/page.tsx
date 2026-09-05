import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

import ActivityHeader from "./components/ActivityHeader";
import ActivitySummary from "./components/ActivitySummary";
import ActivitySummarySkeleton from "./components/ActivitySummarySkeleton";
import ActivityTable from "./components/ActivityTable";
import ActivityTableSkeleton from "./components/ActivityTableSkeleton";

export default async function ActivityPage() {
  const { perms } = await requireUser();

  if (!perms.canSeeAllActivity) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <ActivityHeader />

      <Suspense fallback={<ActivitySummarySkeleton />}>
        <ActivitySummary />
      </Suspense>

      <Suspense fallback={<ActivityTableSkeleton />}>
        <ActivityTable />
      </Suspense>
    </div>
  );
}