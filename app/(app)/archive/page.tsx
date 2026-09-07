import { Suspense } from "react";

import ArchiveHeader from "./components/ArchiveHeader";
import ArchiveNav from "./components/ArchiveNav";
import ArchiveTable from "./components/ArchiveTable";
import ArchiveTableSkeleton from "./components/ArchiveTableSkeleton";

export default async function ArchivePage() {
  return (
    <div className="space-y-6">
      <ArchiveHeader />

      <ArchiveNav />

      <Suspense fallback={<ArchiveTableSkeleton />}>
        <ArchiveTable />
      </Suspense>
    </div>
  );
}