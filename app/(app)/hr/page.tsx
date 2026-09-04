import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import StaffTable from "./components/StaffTable";
import LeaveHistoryTable from "./components/LeaveHistoryTable";
import RecentPayrollTable from "./components/RecentPayrollTable";
import PreparePayrollForm from "./components/PreparePayrollForm";

function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="glass-card animate-pulse p-4">
      <div className="h-3 w-32 rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default async function HrPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();
  if (!perms.canManageHr) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">HR & Payroll</h1>
        <p className="relative z-10 text-sm text-white/80">Employee profiles · documents · payroll</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href="/api/hr/export?all=1&format=csv" className="btn-primary">
          Download all staff (Excel/CSV)
        </a>
        <a
          href="/api/hr/export?all=1&format=pdf"
          className="rounded-xl border border-gray-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-brown"
        >
          Download all staff (PDF)
        </a>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <StaffTable />
      </Suspense>

      <p className="text-sm text-gray-600">
        Open each employee profile to edit personal details, next of kin, spouse, guarantor, health, education, skills, and
        upload documents.
      </p>

      <PreparePayrollForm formKey={searchParams?.ok || "payroll"} preparedBy={user.fullName} />

      <Suspense fallback={<TableSkeleton rows={5} />}>
        <LeaveHistoryTable />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={4} />}>
        <RecentPayrollTable />
      </Suspense>
    </div>
  );
}