import { requireUser } from "@/lib/session";
import { Suspense } from "react";

import ClientPortalHeader from "./components/ClientPortalHeader";
import ClientPortalForm from "./components/ClientPortalForm";
import ClientPortalResult from "./components/ClientPortalResult";
import ClientPortalResultSkeleton from "./components/ClientPortalResultSkeleton";
import ClientPortalInfo from "./components/ClientPortalInfo";

export default async function ClientPortalPage({
  searchParams,
}: {
  searchParams: { code?: string; access?: string };
}) {
  await requireUser();

  const code = searchParams.code || "";
  const access = searchParams.access || "";

  return (
    <div className="space-y-6">
      <ClientPortalHeader />

      <ClientPortalForm
        code={code}
        access={access}
      />

      {code && access && (
        <Suspense fallback={<ClientPortalResultSkeleton />}>
          <ClientPortalResult
            code={code}
            access={access}
          />
        </Suspense>
      )}

      <ClientPortalInfo />
    </div>
  );
}