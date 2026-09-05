import { Suspense } from "react";

import ArchiveHeader from "./components/ArchiveHeader";
import ArchiveNav from "./components/ArchiveNav";
import ArchiveMessage from "./components/ArchiveMessage";
import ArchiveTable from "./components/ArchiveTable";
import ArchiveTableSkeleton from "./components/ArchiveTableSkeleton";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams?: { ok?: string };
}) {

  return (
    <div className="space-y-6">
      <ArchiveHeader />

      <ArchiveNav />

      <ArchiveMessage message={searchParams?.ok} />

      <Suspense fallback={<ArchiveTableSkeleton />}>
        <ArchiveTable />
      </Suspense>
    </div>
  );
}