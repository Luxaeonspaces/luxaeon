import { prisma } from "./prisma";
import type { SessionUser } from "./rbac";

export async function logWork(
  user: SessionUser,
  action: string,
  opts?: { entityType?: string; entityId?: string; details?: string }
) {
  try {
    await prisma.workActivity.create({
      data: {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        department: user.department || null,
        role: user.role,
        action,
        entityType: opts?.entityType,
        entityId: opts?.entityId,
        details: opts?.details,
      },
    });
  } catch (e) {
    console.error("logWork failed", e);
  }
}
