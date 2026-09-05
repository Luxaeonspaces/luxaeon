import { prisma } from "@/lib/prisma";

export async function getActivities() {
  return prisma.workActivity.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 150,
  });
}