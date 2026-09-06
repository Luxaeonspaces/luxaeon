import { prisma } from "@/lib/prisma";
import ApproveSection from "./ApproveSection";

export default async function FounderApprovalSection({ decisionAction, cardActions }) {
  const pendingFinal = await prisma.outflowRequest.findMany({
    where: { status: "Pending Founder" },
    include: { documents: true },
    orderBy: { requestDate: "desc" },
  });

  return (
    <ApproveSection
      title="Founder approval → Finance"
      rows={pendingFinal}
      decisionAction={decisionAction}
      cardActions={cardActions}
      approveLabel="Approve → Head of Finance"
    />
  );
}