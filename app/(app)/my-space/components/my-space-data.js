import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getStaffProfile = cache(async (userId) => {
  return prisma.staffProfile.findUnique({
    where: {
      userId,
    },
  });
});

export const getPayrolls = cache(async (userId) => {
  return prisma.payrollRecord.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });
});

export const getMyLeaves = cache(async (userId) => {
  return prisma.leaveRequest.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
});

export function calculateLeaveUsage(leaves, year) {
  return leaves
    .filter(
      (leave) =>
        leave.year === year &&
        ["Approved", "Pending HOD", "Pending HR"].includes(
          leave.status
        )
    )
    .reduce(
      (total, leave) => total + leave.days,
      0
    );
}