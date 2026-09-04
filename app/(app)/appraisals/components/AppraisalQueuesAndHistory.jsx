import { prisma } from "@/lib/prisma";
import HodQueueSection from "./HodQueueSection";
import HrQueueSection from "./HrQueueSection";
import FounderQueueSection from "./FounderQueueSection";
import AppraisalHistoryTable from "./AppraisalHistoryTable";

export default async function AppraisalQueuesAndHistory({ userId, department, perms }) {
  let appraisals;
  if (perms.canManageAppraisals || perms.isFounder) {
    appraisals = await prisma.appraisal.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  } else if (perms.isHod) {
    // HOD views all in their department (and can approve queue)
    appraisals = await prisma.appraisal.findMany({
      where: {
        OR: [{ department: department || undefined }, { userId }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } else {
    appraisals = await prisma.appraisal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  const pendingHod = appraisals.filter((a) => a.status === "Self Submitted");
  const pendingHr = appraisals.filter((a) => a.status === "HOD Approved");
  const pendingFounder = appraisals.filter((a) => a.status === "HR Approved");

  return (
    <>
      {perms.canHodApproveAppraisal && <HodQueueSection pendingHod={pendingHod} />}
      {perms.canManageAppraisals && <HrQueueSection pendingHr={pendingHr} />}
      {perms.isFounder && <FounderQueueSection pendingFounder={pendingFounder} />}
      <AppraisalHistoryTable appraisals={appraisals} />
    </>
  );
}