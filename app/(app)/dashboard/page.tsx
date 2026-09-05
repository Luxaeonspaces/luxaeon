import { requireUser } from "@/lib/session";
import { Suspense } from "react";
import MetricsSection from "./components/MetricsSection";
import StageBreakdown from "./components/StageBreakdown";
import PendingOutflowsSection from "./components/PendingOutflowsSection";
import SalesTargetTracker from "./components/SalesTargetTracker";
import ActiveProjectsTable from "./components/ActiveProjectsTable";
import FounderOutflowsTable from "./components/FounderOutflowsTable";

function CardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card h-20 animate-pulse" />
      ))}
    </div>
  );
}

function BlockSkeleton() {
  return <div className="glass-card h-32 animate-pulse p-5" />;
}

export default async function DashboardPage() {
  const { user, perms } = await requireUser();
  const first = (user.fullName || "").split(" ")[0] || user.fullName;

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Hey {first} 👋</h1>
        <p className="relative z-10 mt-1 text-sm text-white/85">
          {user.role}
          {user.department ? ` · ${user.department}` : ""} · here is your snapshot
        </p>
      </div>

      <Suspense fallback={<CardsSkeleton />}>
        <MetricsSection perms={perms} />
      </Suspense>

      <Suspense fallback={<BlockSkeleton />}>
        <StageBreakdown />
      </Suspense>

      <Suspense fallback={<BlockSkeleton />}>
        <PendingOutflowsSection userId={user.id} department={user.department} perms={perms} />
      </Suspense>

      {perms.isSales && (
        <Suspense fallback={<BlockSkeleton />}>
          <SalesTargetTracker userId={user.id} />
        </Suspense>
      )}

      <Suspense fallback={<BlockSkeleton />}>
        <ActiveProjectsTable />
      </Suspense>

      {perms.isFounder && (
        <Suspense fallback={<BlockSkeleton />}>
          <FounderOutflowsTable />
        </Suspense>
      )}
    </div>
  );
}