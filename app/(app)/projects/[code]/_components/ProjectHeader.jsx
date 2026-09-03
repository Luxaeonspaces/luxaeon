import Link from "next/link";

export default function ProjectHeader({
  project,
  isLocked,
  canComplete,
  completeProjectAction,
  error,
  ok,
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="main-header flex-1">
          <p className="relative z-10 text-xs uppercase tracking-wide text-white/60">Project detail</p>
          <h1 className="relative z-10 font-display text-2xl font-semibold">{project.projectCode}</h1>
          <p className="relative z-10 text-sm text-white/85">
            {project.clientName}
            {project.projectName ? ` · ${project.projectName}` : ""}
            {project.salesPersonName ? ` · Sales: ${project.salesPersonName}` : ""}
          </p>
        </div>
        <Link href="/projects" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black">
          ← All projects
        </Link>
      </div>

      {isLocked && (
        <div className="rounded-xl border border-gray-300 bg-whitesmoke px-4 py-3 text-sm text-black">
          <strong>Completed &amp; archived.</strong> This project is locked — details can be viewed and downloaded only.
          <a href="/archive" className="ml-2 font-semibold underline">Open Project Archives</a>
        </div>
      )}

      {!isLocked && canComplete && (
        <form action={completeProjectAction} className="rounded-2xl border-2 border-brown bg-brown/5 p-4">
          <p className="mb-2 text-sm font-semibold text-brown">Project completion</p>
          <p className="mb-3 text-xs text-gray-600">
            When you mark this project completed, it becomes read-only and moves to <strong>Project Archives</strong>.
          </p>
          <button
            type="submit"
            className="w-full rounded-xl bg-brown px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 sm:w-auto"
          >
            Mark project completed
          </button>
        </form>
      )}

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</p>}
    </>
  );
}