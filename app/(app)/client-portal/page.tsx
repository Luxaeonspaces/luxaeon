import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ClientPortalPage({
  searchParams,
}: {
  searchParams: { code?: string; access?: string };
}) {
  await requireUser();
  const code = searchParams.code || "";
  const access = searchParams.access || "";

  let project = null;
  let docs: Awaited<ReturnType<typeof prisma.clientDocument.findMany>> = [];
  if (code && access) {
    project = await prisma.project.findFirst({
      where: { projectCode: code, clientAccessCode: access },
    });
    if (project) {
      docs = await prisma.clientDocument.findMany({
        where: { projectCode: code },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Client Service Portal</h1>
        <p className="relative z-10 text-sm text-white/80">Share Project Code + Access Code with clients</p>
      </div>

      <form className="glass-card grid gap-3 p-5 md:grid-cols-3">
        <input name="code" className="input" placeholder="Project code" defaultValue={code} />
        <input name="access" className="input" placeholder="Access code" defaultValue={access} />
        <button className="btn-primary" formAction="/client-portal" formMethod="get">
          View status
        </button>
      </form>

      {code && access && !project && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Invalid Project Code or Access Code</p>
      )}

      {project && (
        <div className="glass-card space-y-3 p-5">
          <p className="text-lg font-semibold text-burgundy">Welcome, {project.clientName}</p>
          <p>
            <strong>Stage:</strong> {project.stage}
          </p>
          <p>
            <strong>Handover:</strong> {project.targetHandover || "TBC"}
          </p>
          <p>
            <strong>Location:</strong> {project.location || "—"}
          </p>
          <div className="pt-2">
            <h3 className="font-semibold text-burgundy">Documents</h3>
            {docs.length === 0 && <p className="text-sm text-gray-500">No documents yet</p>}
            <ul className="mt-2 space-y-1 text-sm">
              {docs.map((d) => (
                <li key={d.id}>
                  {d.originalName} · by {d.uploadedBy} ({d.uploadedByRole})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="glass-card p-5 text-sm text-gray-600">
        <p className="font-semibold text-burgundy">Website embed</p>
        <p className="mt-1">
          Public link (no login): <a className="text-burgundy underline" href="/portal">/portal</a>. Host online and link from luxaeonspaces.com to{" "}
          <code className="rounded bg-cream px-1">/client-portal</code> so clients can check progress on phone or laptop.
        </p>
      </div>
    </div>
  );
}
