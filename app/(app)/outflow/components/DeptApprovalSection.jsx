import { prisma } from "@/lib/prisma";
import ApproveSection from "./ApproveSection";

export default async function DeptApprovalSection({ user, perms, decisionAction, cardActions }) {
  const pendingDept = await prisma.outflowRequest.findMany({
    where: {
      status: "Pending Department",
      ...(perms.isFounder
        ? {}
        : perms.isHod && user.department
          ? { department: user.department }
          : { department: "__none__" }),
    },
    include: { documents: true },
    orderBy: { requestDate: "desc" },
  });

  return (
    <ApproveSection title="Department Head review" rows={pendingDept} decisionAction={decisionAction} cardActions={cardActions} />
  );
}