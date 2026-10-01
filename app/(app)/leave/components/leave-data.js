import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { LEAVE_TYPES } from "./leave-types";

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

export function getLeaveTypeBalance(leaves, leaveType, year) {
  const type = LEAVE_TYPES[leaveType];

  if (!type) {
    return {
      used: 0,
      balance: 0,
      maxDays: 0,
    };
  }

  const used = leaves
    .filter(
      (leave) =>
        leave.year === year &&
        leave.leaveType === leaveType &&
        ["Approved", "Pending HOD", "Pending HR"].includes(
          leave.status
        )
    )
    .reduce((total, leave) => total + leave.days, 0);

  return {
    used,
    balance: Math.max(0, type.maxDays - used),
    maxDays: type.maxDays,
  };
}

export function getAllLeaveBalances(leaves, year) {
  return Object.entries(LEAVE_TYPES).map(
    ([key, type]) => {
      const used = leaves
        .filter(
          (leave) =>
            leave.year === year &&
            leave.leaveType === key &&
            ["Approved", "Pending HOD", "Pending HR"].includes(
              leave.status
            )
        )
        .reduce(
          (total, leave) => total + leave.days,
          0
        );

      return {
        key,
        label: type.label,
        maxDays: type.maxDays,
        used,
        balance: Math.max(
          0,
          type.maxDays - used
        ),
        requiresDocument:
          type.requiresDocument,
      };
    }
  );
}