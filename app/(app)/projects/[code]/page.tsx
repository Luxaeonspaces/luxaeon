import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notFound } from "next/navigation";
import { addNote, updateProjectDetails, recordProjectPayment, editProjectPayment, completeProject } from "./actions";
import ProjectTools from "@/components/ProjectTools";
import { PROJECT_STAGES } from "@/lib/rbac";
import ProjectHeader from "./_components/ProjectHeader";
import ProjectSummaryCards from "./_components/ProjectSummaryCards";
import ProjectDetailsForm from "./_components/ProjectDetailsForm";
import ProjectPayments from "./_components/ProjectPayments";
import ProjectFilesPanel from "./_components/ProjectFilesPanel";
import ProjectNotes from "./_components/ProjectNotes";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams?: { error?: string; ok?: string };
}) {
  const { user, perms } = await requireUser();
  const canEdit = perms.isFounder || perms.isHod || perms.isFinance;

  const project = await prisma.project.findUnique({
    where: { projectCode: params.code },
    include: {
      notesLog: { orderBy: { createdAt: "desc" } },
      files: { orderBy: { createdAt: "desc" } },
      clientDocs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) notFound();

  const paymentTxns = await prisma.transaction.findMany({
    where: { projectCode: project.projectCode, type: "Income" },
    include: { documents: true },
    orderBy: { createdAt: "desc" },
  });
  const paidFromHistory = paymentTxns.reduce((a, t) => a + t.amount, 0);

  const balance = Math.max(0, (project.designFee || 0) - (project.amountPaid || 0));
  const isLocked = project.status === "Completed" || project.stage === "Completed";
  const canEditActive = canEdit && !isLocked;
  const stageIdx = Math.max(0, PROJECT_STAGES.indexOf(project.stage as any));
  const progress = ((stageIdx + 1) / PROJECT_STAGES.length) * 100;
  const canComplete = perms.isFounder || perms.isHod || perms.isFinance || perms.isDesign;

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        isLocked={isLocked}
        canComplete={canComplete}
        completeProjectAction={completeProject.bind(null, project.projectCode)}
        error={searchParams?.error}
        ok={searchParams?.ok}
      />

      <ProjectSummaryCards project={project} balance={balance} progress={progress} />

      <ProjectDetailsForm
        project={project}
        canEditActive={canEditActive}
        isLocked={isLocked}
        updateProjectDetailsAction={updateProjectDetails.bind(null, project.projectCode)}
      />

      <ProjectPayments
        project={project}
        paymentTxns={paymentTxns as any}
        paidFromHistory={paidFromHistory}
        balance={balance}
        canEditActive={canEditActive}
        editProjectPaymentAction={editProjectPayment.bind(null, project.projectCode)}
        recordProjectPaymentAction={recordProjectPayment.bind(null, project.projectCode)}
        formKey={searchParams?.ok || "pay-form"}
      />

      <ProjectFilesPanel project={project as any} />

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-brown">Documents & PDFs</h2>
        <ProjectTools projectCode={project.projectCode} />
      </div>

      <ProjectNotes project={project as any} addNoteAction={addNote.bind(null, project.id)} formKey={searchParams?.ok || "note"} />
    </div>
  );
}