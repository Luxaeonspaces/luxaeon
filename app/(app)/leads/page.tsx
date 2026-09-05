import { Suspense } from "react";
import { requireUser } from "@/lib/session";

import LeadsHeader from "./components/LeadsHeader";
import LeadForm from "./components/LeadForm";
import LeadTable from "./components/LeadTable";
import LeadTableSkeleton from "./components/LeadTableSkeleton";
import { getSalesPeople } from "./components/leads-data";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: {
    ok?: string;
    created?: string;
    error?: string;
  };
}) {
  const { user, perms } = await requireUser();

  const salesPeople = await getSalesPeople();

  return (
    <div className="space-y-6">
      <LeadsHeader />

      <LeadForm
        user={user}
        perms={perms}
        salesPeople={salesPeople}
        message={searchParams?.ok}
      />

      <Suspense fallback={<LeadTableSkeleton />}>
        <LeadTable />
      </Suspense>
    </div>
  );
}