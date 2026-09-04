import { requireUser } from "@/lib/session";
import { Suspense } from "react";
import ProcDocsUpload from "@/components/ProcDocsUpload";
import NewRequestForm from "./components/NewRequestForm";
import ProcurementQueuesAndList from "./components/ProcurementQueuesAndList";

function FormSkeleton() {
  return <div className="glass-card h-16 animate-pulse" />;
}

function QueueSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card h-32 animate-pulse p-5">
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default async function ProcurementPage({
  searchParams,
}: {
  searchParams?: { created?: string; ok?: string };
}) {
  const { user, perms } = await requireUser();

  const canRequest = perms.isFounder || perms.isDesign || perms.isProcurement || perms.isHod;
  const isProcHod = perms.isFounder || (perms.isHod && perms.isProcurement);

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Procurement</h1>
        <p className="relative z-10 text-sm text-white/85">
          Design may request · Procurement HOD → Founder → Head of Finance (same matrix as outflow)
        </p>
      </div>

      {searchParams?.ok && (
        <p className="rounded-xl border border-brown/40 bg-brown/10 px-4 py-3 text-sm text-brown">{searchParams.ok}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <a
          href="/api/export/procurement?all=1"
          className="rounded-xl border border-gray-300 bg-whitesmoke px-4 py-2.5 text-sm font-semibold text-brown"
        >
          Download all procurement (Excel)
        </a>
      </div>

      {canRequest && (
        <Suspense fallback={<FormSkeleton />}>
          <NewRequestForm formKey={searchParams?.ok || "proc-create"} />
        </Suspense>
      )}

      {searchParams?.created && (
        <div className="glass-card p-4">
          <p className="mb-2 text-sm font-semibold text-brown">Upload supporting documents</p>
          <ProcDocsUpload procurementId={searchParams.created} />
        </div>
      )}

      <Suspense fallback={<QueueSkeleton />}>
        <ProcurementQueuesAndList currentUserFullName={user.fullName} perms={perms} isProcHod={isProcHod} />
      </Suspense>
    </div>
  );
}