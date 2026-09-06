import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import GeneratePayrollForm from "./components/GeneratePayrollForm";
import BatchesList from "./components/BatchesList";

function BatchesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card h-40 animate-pulse p-5">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-full rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams?: { ok?: string; error?: string };
}) {
  const { perms } = await requireUser();
  if (!perms.canManagePayroll) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Payroll</h1>
        <p className="relative z-10 text-sm text-white/80">
          HR generates → <strong>Founder approves</strong> → <strong>Head of Finance only</strong> disburses (one transaction)
        </p>
      </div>

      {searchParams?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.ok && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{searchParams.ok}</p>}

      <div className="flex flex-wrap gap-2">
        <a
          href="/api/export/payroll?all=1"
          className="rounded-xl border border-gray-300 bg-whitesmoke px-4 py-2.5 text-sm font-semibold text-brown"
        >
          Download all payroll (Excel)
        </a>
      </div>

      {perms.canGeneratePayroll && <GeneratePayrollForm formKey={searchParams?.ok || "pay"} />}

      <Suspense fallback={<BatchesSkeleton />}>
        <BatchesList perms={perms} />
      </Suspense>
    </div>
  );
}