import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

import AuditHeader from "./components/AuditHeader";
import AuditTable from "./components/AuditTable";
import AuditTableSkeleton from "./components/AuditTableSkeleton";

export default async function AuditPage() {
  const { perms } = await requireUser();

  if (!perms.canSeeAudit) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <AuditHeader />

      <Suspense fallback={<AuditTableSkeleton />}>
        <AuditTable />
      </Suspense>
    </div>
  );
}