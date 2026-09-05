import { prisma } from "@/lib/prisma";

import ClientPortalError from "./ClientPortalError";
import ClientProject from "./ClientProject";

export default async function ClientPortalResult({
  code,
  access,
}) {
  const project = await prisma.project.findFirst({
    where: {
      projectCode: code,
      clientAccessCode: access,
    },
  });

  if (!project) {
    return <ClientPortalError />;
  }

  const docs = await prisma.clientDocument.findMany({
    where: {
      projectCode: code,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <ClientProject
      project={project}
      docs={docs}
    />
  );
}