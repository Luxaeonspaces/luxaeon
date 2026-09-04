import { requireUser } from "@/lib/session";
import { Suspense } from "react";
import SelfAppraisalForm from "./components/SelfAppraisalForm";
import AppraisalQueuesAndHistory from "./components/AppraisalQueuesAndHistory";

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

export default async function AppraisalsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Appraisals (Quarterly)</h1>
        <p className="relative z-10 text-sm text-white/80">Flow: Self → Head of Dept → HR → Founder</p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <SelfAppraisalForm userId={user.id} isSales={perms.isSales} formKey={searchParams?.ok || "appraisal"} />
      </Suspense>

      <Suspense fallback={<QueueSkeleton />}>
        <AppraisalQueuesAndHistory userId={user.id} department={user.department} perms={perms} />
      </Suspense>
    </div>
  );
}