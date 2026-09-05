import { Suspense } from "react";
import { requireUser } from "@/lib/session";

import DocumentsHeader from "./components/DocumentsHeader";
import DocumentsInfo from "./components/DocumentsInfo";
import DocumentsList from "./components/DocumentsList";
import DocumentsSkeleton from "./components/DocumentsSkeleton";

export default async function DocumentsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <DocumentsHeader />

      <DocumentsInfo />

      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentsList />
      </Suspense>
    </div>
  );
}