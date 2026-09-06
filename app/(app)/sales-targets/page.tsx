import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SetTargetForm from "./components/SetTargetForm";
import TargetsList from "./components/TargetsList";

function FormSkeleton() {
  return <div className="glass-card h-40 animate-pulse" />;
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card h-80 animate-pulse p-5" />
      ))}
    </div>
  );
}

export default async function SalesTargetsPage({
  searchParams,
}: {
  searchParams?: { ok?: string; created?: string; error?: string };
}) {
  const { user, perms } = await requireUser();
  if (!perms.canManageSalesTargets) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Sales Targets</h1>
        <p className="relative z-10 text-sm text-white/80">
          Finance progress and leads progress tracked separately · client matched to marketer
        </p>
      </div>

      {(perms.canSetSalesTargets || perms.isFounder) && (
        <Suspense fallback={<FormSkeleton />}>
          <SetTargetForm formKey={searchParams?.ok || "target"} />
        </Suspense>
      )}

      <Suspense fallback={<ListSkeleton />}>
        <TargetsList userId={user.id} perms={perms} />
      </Suspense>
    </div>
  );
}