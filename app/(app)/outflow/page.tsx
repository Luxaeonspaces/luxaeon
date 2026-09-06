import { requireUser } from "@/lib/session";
import { Suspense } from "react";
import { createOutflow, decideDept, decideFinal, releaseFunds, editOutflow, cancelOutflow, recallOutflow, resubmitOutflow } from "./actions";
import NewOutflowForm from "./components/NewOutflowForm";
import DeptApprovalSection from "./components/DeptApprovalSection";
import FounderApprovalSection from "./components/FounderApprovalSection";
import FinanceReleaseSectionAsync from "./components/FinanceReleaseSectionAsync";
import OutflowHistorySectionAsync from "./components/OutflowHistorySectionAsync";

function SectionSkeleton() {
  return (
    <div className="glass-card animate-pulse p-5">
      <div className="h-4 w-40 rounded bg-gray-200" />
      <div className="mt-3 h-16 w-full rounded bg-gray-100" />
    </div>
  );
}

export default async function OutflowPage({
  searchParams,
}: {
  searchParams?: { created?: string; ok?: string; error?: string };
}) {
  const { user, perms } = await requireUser();

  const cardActions = {
    editOutflowAction: editOutflow,
    recallOutflowAction: recallOutflow,
    cancelOutflowAction: cancelOutflow,
    resubmitOutflowAction: resubmitOutflow,
  };

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Outflow Approvals</h1>
        <p className="relative z-10 text-sm text-white/80">
          Expense workflow: Maker → Dept HOD (own dept) → Founder (approve) → Head of Finance (disburse only)
        </p>
      </div>

      {searchParams?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.ok && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{searchParams.ok}</p>}

      <NewOutflowForm
        user={user}
        createOutflowAction={createOutflow}
        createdId={searchParams?.created}
        formKey={searchParams?.ok || searchParams?.created || "outflow-create"}
      />

      {perms.canDeptApprove && (
        <Suspense fallback={<SectionSkeleton />}>
          <DeptApprovalSection user={user} perms={perms} decisionAction={decideDept} cardActions={cardActions} />
        </Suspense>
      )}

      {perms.canFinalApprove && (
        <Suspense fallback={<SectionSkeleton />}>
          <FounderApprovalSection decisionAction={decideFinal} cardActions={cardActions} />
        </Suspense>
      )}

      {perms.canDisburseFunds && (
        <Suspense fallback={<SectionSkeleton />}>
          <FinanceReleaseSectionAsync releaseFundsAction={releaseFunds} cardActions={cardActions} />
        </Suspense>
      )}

      <Suspense fallback={<SectionSkeleton />}>
        <OutflowHistorySectionAsync user={user} perms={perms} cardActions={cardActions} />
      </Suspense>
    </div>
  );
}