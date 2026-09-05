import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getTransaction = cache(async (id) => {
  return prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      documents: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
});

export async function getTransactionAudits(transactionId, txnId) {
  return prisma.transactionAudit.findMany({
    where: {
      OR: [
        { transactionId },
        { txnId },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}