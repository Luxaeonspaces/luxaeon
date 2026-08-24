import { prisma } from "@/lib/prisma";
import PortalClient from "./PortalClient";

export const dynamic = "force-dynamic";

export default async function PublicPortalPage({
  searchParams,
}: {
  searchParams: { code?: string; access?: string };
}) {
  const code = (searchParams.code || "").trim();
  const access = (searchParams.access || "").trim();

  let project = null;
  let docs: { id: string; originalName: string | null; filename: string; uploadedBy: string | null; uploadedByRole: string | null; description: string | null }[] = [];

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
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl page-enter">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Luxaeon" className="mx-auto mb-3 h-14 w-14 object-contain" />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">Client Service Portal</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-burgundy">Luxaeon Spaces</h1>
          <p className="mt-2 text-sm text-gray-500">Check your project progress · no staff login needed</p>
        </div>

        <PortalClient
          initialCode={code}
          initialAccess={access}
          project={
            project
              ? {
                  projectCode: project.projectCode,
                  clientName: project.clientName,
                  projectName: project.projectName,
                  stage: project.stage,
                  location: project.location,
                  targetHandover: project.targetHandover,
                }
              : null
          }
          invalid={Boolean(code && access && !project)}
          docs={docs.map((d) => ({
            id: d.id,
            name: d.originalName || d.filename,
            filename: d.filename,
            by: d.uploadedBy,
            role: d.uploadedByRole,
            description: d.description,
          }))}
        />

        <p className="mt-8 text-center text-xs text-gray-400">
          Staff members: sign in at <a href="/login" className="text-burgundy underline">/login</a>
        </p>
      </div>
    </div>
  );
}
