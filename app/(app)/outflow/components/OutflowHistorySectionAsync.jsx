import { prisma } from "@/lib/prisma";
import OutflowHistorySection from "./OutflowHistorySection";

export default async function OutflowHistorySectionAsync({ user, perms, cardActions }) {
  // History: maker's HOD = own department only; Founder = all; others = own requests
  const all = await prisma.outflowRequest.findMany({
    where: perms.isFounder
      ? undefined
      : perms.isHod && user.department
        ? { department: user.department }
        : { OR: [{ requestedById: user.id }, { requestedBy: user.fullName }] },
    include: { documents: true },
    orderBy: { requestDate: "desc" },
    take: 40,
  });

  return <OutflowHistorySection rows={all} user={user} perms={perms} cardActions={cardActions} />;
}