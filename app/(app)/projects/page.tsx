import { requireUser } from "@/lib/session";
import { Suspense } from "react";
import Link from "next/link";
import CreateProjectForm from "./components/CreateProjectForm";
import ProjectsTable from "./components/ProjectsTable";

function FormSkeleton() {
  return <div className="glass-card h-16 animate-pulse" />;
}

function TableSkeleton() {
  return (
    <div className="glass-card animate-pulse p-4">
      <div className="h-3 w-32 rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { ok?: string; created?: string; error?: string };
}) {
  const { user, perms } = await requireUser();

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Projects</h1>
        <p className="relative z-10 text-sm text-white/80">Pipeline · created by tracking</p>
      </div>

      <nav aria-label="Project views" className="flex max-w-full overflow-x-auto border-b border-gray-200">
        <Link
          href="/projects"
          className="shrink-0 border-b-2 border-brown px-4 py-3 text-sm font-semibold text-brown"
          aria-current="page"
        >
          Active Projects
        </Link>
        <Link
          href="/archive"
          className="shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-gray-500 transition hover:border-brown hover:text-brown"
        >
          Project Archives
        </Link>
      </nav>

      <div className="glass-card flex flex-wrap gap-2 p-4">
        <span className="w-full text-sm font-semibold text-brown">Download project tracker</span>
        <a
          href="/api/export/project-tracker?format=csv"
          className="rounded-xl border border-gray-300 bg-whitesmoke px-3 py-2 text-xs font-semibold text-brown"
        >
          Tracker Excel
        </a>
        <a
          href="/api/export/project-tracker?format=pdf"
          className="rounded-xl border border-gray-300 bg-whitesmoke px-3 py-2 text-xs font-semibold text-brown"
        >
          Tracker PDF
        </a>
        <a
          href="/api/export/project-tracker?format=word"
          className="rounded-xl border border-gray-300 bg-whitesmoke px-3 py-2 text-xs font-semibold text-brown"
        >
          Tracker Word
        </a>
        <a
          href="/archive"
          className="rounded-xl border border-brown/40 bg-brown/10 px-3 py-2 text-xs font-semibold text-brown"
        >
          Project Archives →
        </a>
      </div>

      {perms.canCreateProjects && (
        <Suspense fallback={<FormSkeleton />}>
          <CreateProjectForm userFullName={user.fullName} formKey={searchParams?.ok || "create-project"} />
        </Suspense>
      )}

      <Suspense fallback={<TableSkeleton />}>
        <ProjectsTable />
      </Suspense>
    </div>
  );
}