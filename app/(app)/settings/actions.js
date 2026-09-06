"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function changePassword(formData) {
  const { user } = await requireUser();
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");

  if (next.length < 6) {
    redirect("/settings?error=" + encodeURIComponent("New password must be at least 6 characters"));
  }
  if (next !== confirm) {
    redirect("/settings?error=" + encodeURIComponent("New password and confirmation do not match"));
  }

  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row) redirect("/settings?error=" + encodeURIComponent("Account not found"));

  const ok = await bcrypt.compare(current, row.passwordHash);
  if (!ok) {
    redirect("/settings?error=" + encodeURIComponent("Current password is incorrect"));
  }

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

  redirect("/settings?ok=" + encodeURIComponent("Password updated"));
}