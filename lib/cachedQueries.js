import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma } from "./prisma";

// Full user roster, including HR-relevant relations. Shared by /users, /hr,
// and /onboarding so all three read from one cache entry instead of three
// separate DB round-trips. Invalidated via revalidateTag("users") from any
// action in app/(app)/users/actions.ts that creates/edits/disables a user.
export const getAllUsers = unstable_cache(
  async () =>
    prisma.user.findMany({
      include: { profile: true, hrDocuments: true },
    }),
  ["all-users"],
  { tags: ["users"] }
);

export const getSalesPeople = unstable_cache(
  async () =>
    prisma.user.findMany({
      where: {
        active: true,
        OR: [
          { department: "Sales & Marketing" },
          { department: "Sales" },
          { department: "Marketing" },
        ],
      },
      orderBy: { fullName: "asc" },
    }),
  ["sales-people"],
  { tags: ["users"] }
);

// Leads are created from public-facing flows in some environments, so we do not
// use a persistent global cache here. A public submission cannot reliably trigger
// a Next.js revalidation, and that would make the lead list go stale. Use a
// request-scoped memo instead to keep reads cheap without creating stale static data.
export const getLeads = cache(async () => {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });
});

export const getUserLeaves = unstable_cache(
  async (userId) =>
    prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ["user-leaves"],
  { tags: ["leave"] }
);

export const getVisibleTeamLeaves = unstable_cache(
  async (department, canManageHr, isFounder) => {
    if (isFounder || canManageHr) {
      return prisma.leaveRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }

    if (department) {
      return prisma.leaveRequest.findMany({
        where: { department },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }

    return [];
  },
  ["visible-team-leaves"],
  { tags: ["leave"] }
);

export const getEmployeeProfileForHr = unstable_cache(
  async (userId) =>
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    }),
  ["employee-profile"],
  { tags: ["hr", "users"] }
);

export const getProjectDetailForPage = unstable_cache(
  async (projectCode) =>
    prisma.project.findUnique({
      where: { projectCode },
      include: {
        notesLog: { orderBy: { createdAt: "desc" } },
        files: { orderBy: { createdAt: "desc" } },
        clientDocs: { orderBy: { createdAt: "desc" } },
      },
    }),
  ["project-detail"],
  { tags: ["projects"] }
);

export const getProjectIncomeTxns = unstable_cache(
  async (projectCode) =>
    prisma.transaction.findMany({
      where: { projectCode, type: "Income" },
      include: { documents: true },
      orderBy: { createdAt: "desc" },
    }),
  ["project-income-txns"],
  { tags: ["projects", "finance"] }
);