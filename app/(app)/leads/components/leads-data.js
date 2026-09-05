import { prisma } from "@/lib/prisma";
import { cache } from "react";

export async function getSalesPeople() {
  return prisma.user.findMany({
    where: {
      active: true,
      OR: [
        { department: "Sales & Marketing" },
        { department: "Sales" },
        { department: "Marketing" },
      ],
    },
    orderBy: {
      fullName: "asc",
    },
  });
}

export const getLeads = cache(async () => {
  return prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
});