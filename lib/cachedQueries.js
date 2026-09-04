import { unstable_cache } from "next/cache";
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