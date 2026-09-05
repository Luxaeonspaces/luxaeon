import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const MAX_DAYS = 60;

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

export async function getTeamLeaves({ user, perms }) {
  if (perms.isFounder || perms.canManageHr) {
    return prisma.leaveRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
  }

  if (perms.isHod && user.department) {
    return prisma.leaveRequest.findMany({
      where: {
        department: user.department,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
  }

  return [];
}

export function calculateLeaveBalance(leaves, year) {
  const used = leaves
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

  return {
    used,
    balance: MAX_DAYS - used,
  };
}