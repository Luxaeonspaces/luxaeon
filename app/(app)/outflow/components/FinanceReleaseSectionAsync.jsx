import { prisma } from "@/lib/prisma";
import FinanceReleaseSection from "./FinanceReleaseSection";

export default async function FinanceReleaseSectionAsync({ releaseFundsAction, cardActions }) {
  const pendingFinance = await prisma.outflowRequest.findMany({
    where: { status: "Pending Finance" },
    include: { documents: true },
    orderBy: { requestDate: "desc" },
  });

  return <FinanceReleaseSection rows={pendingFinance} releaseFundsAction={releaseFundsAction} cardActions={cardActions} />;
}