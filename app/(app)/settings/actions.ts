"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function changePassword(formData: FormData) {
  const { user } = await requireUser();
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");
  if (next.length < 6 || next !== confirm) return;

  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row) return;
  const ok = await bcrypt.compare(current, row.passwordHash);
  if (!ok) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 10) },
  });
  await prisma.auditLog.create({
    data: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      action: "Password Changed",
      entityType: "user",
      entityId: user.id,
    },
  });
}
