import { prisma } from "@/lib/prisma";
import ApprovalQueue from "./ApprovalQueue";
import ProcCard from "./ProcCard";
import { hodApproveProcurement, founderApproveProcurement, financeDisburseProcurement } from "../actions";

export default async function ProcurementQueuesAndList({ currentUserFullName, perms, isProcHod }) {
  const rows = await prisma.procurementRequest.findMany({
    include: { documents: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      {isProcHod && (
        <ApprovalQueue
          title="Head of Procurement review"
          rows={rows.filter((r) => r.status === "Pending Procurement HOD")}
          action={hodApproveProcurement}
          canUpload
        />
      )}
      {perms.isFounder && (
        <ApprovalQueue
          title="Founder approval"
          rows={rows.filter((r) => r.status === "Pending Founder")}
          action={founderApproveProcurement}
        />
      )}
      {perms.isHeadOfFinance && (
        <ApprovalQueue
          title="Head of Finance — disbursement"
          rows={rows.filter((r) => r.status === "Pending Finance")}
          action={financeDisburseProcurement}
          finance
        />
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-brown">All requests</h2>
        {rows.map((r) => (
          <ProcCard
            key={r.id}
            r={r}
            canUpload={perms.isProcurement || r.requestedBy === currentUserFullName}
            canEdit={
              (r.status === "Pending Procurement HOD" || r.status === "Recalled") &&
              (r.requestedBy === currentUserFullName || perms.isFounder || (perms.isHod && perms.isProcurement))
            }
          />
        ))}
      </section>
    </>
  );
}