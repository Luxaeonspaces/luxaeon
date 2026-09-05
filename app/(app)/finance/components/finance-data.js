import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getTransactions = cache(async () => {
  return prisma.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
  });
});