import { requireUser } from "@/lib/session";
import { Suspense } from "react";
import ProfileSummary from "./components/ProfileSummary";
import MyPayslipsTable from "./components/MyPayslipsTable";

function SummarySkeleton() {
  return <div className="glass-card h-32 animate-pulse p-5" />;
}

function TableSkeleton() {
  return (
    <div className="glass-card animate-pulse p-4">
      <div className="h-3 w-24 rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const { user } = await requireUser();

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">My Profile & Payslip</h1>
      </div>

      <Suspense fallback={<SummarySkeleton />}>
        <ProfileSummary user={user} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <MyPayslipsTable user={user} />
      </Suspense>
    </div>
  );
}