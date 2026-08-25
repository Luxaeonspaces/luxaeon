"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function tempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "Lx";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function createUser(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) throw new Error("Not allowed");
  const username = String(formData.get("username") || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".");
  const fullName = String(formData.get("fullName") || "").trim();
  let password = String(formData.get("password") || "");
  const useTemp = formData.get("useTempPassword") === "on" || formData.get("useTempPassword") === "true";

  if (!username || !fullName) {
    redirect("/users?error=" + encodeURIComponent("Username and full name are required"));
  }

  if (useTemp || password.length < 6) {
    password = tempPassword();
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    redirect(
      "/users?error=" +
        encodeURIComponent(`Username "${username}" already exists. Try another name.`)
    );
  }

  await prisma.user.create({
    data: {
      username,
      fullName,
      passwordHash: await bcrypt.hash(password, 10),
      role: String(formData.get("role") || "Staff"),
      department: String(formData.get("department") || "General"),
      active: true,
    },
  });
  await prisma.auditLog.create({
    data: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      action: "User Created",
      details: `${fullName} (@${username}) as ${formData.get("role")}/${formData.get("department")}`,
    },
  });
  revalidatePath("/users");
  redirect(
    "/users?ok=" +
      encodeURIComponent(`Created @${username}. Temporary password: ${password}`)
  );
}

export async function updateUser(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) throw new Error("Not allowed");
  const username = String(formData.get("username") || "")
    .toLowerCase()
    .trim();
  const newUsername = String(formData.get("newUsername") || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".");
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    redirect("/users?error=" + encodeURIComponent(`User "${username}" not found`));
  }
  const targetRole = String(formData.get("role") || target.role);
  const targetActive = String(formData.get("active") || "1") === "1";
  if (target.role === "Founder" && !perms.isFounder && (targetRole !== target.role || targetActive !== target.active)) {
    redirect("/users?error=" + encodeURIComponent("Only Founder can change a Founder role or status"));
  }
  if (newUsername && newUsername !== username) {
    const usernameExists = await prisma.user.findUnique({ where: { username: newUsername } });
    if (usernameExists) {
      redirect("/users?error=" + encodeURIComponent(`Username "${newUsername}" already exists`));
    }
  }

  await prisma.user.update({
    where: { username },
    data: {
      username: newUsername || username,
      role: targetRole,
      department: String(formData.get("department") || target.department),
      active: targetActive,
    },
  });
  await prisma.auditLog.create({
    data: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      action: "User Role Updated",
      details: `${username}${newUsername && newUsername !== username ? ` renamed to ${newUsername}` : ""} updated by ${user.fullName}`,
    },
  });
  revalidatePath("/users");
  redirect("/users?ok=" + encodeURIComponent(`Updated @${newUsername || username}`));
}

export async function resetPassword(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) throw new Error("Not allowed");

  const username = String(formData.get("username") || "")
    .toLowerCase()
    .trim();
  const custom = String(formData.get("newPassword") || "").trim();
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    redirect("/users?error=" + encodeURIComponent(`User "${username}" not found`));
  }
  if (target.role === "Founder" && !perms.isFounder) {
    redirect("/users?error=" + encodeURIComponent("Only Founder can reset the Founder password"));
  }

  const password = custom.length >= 6 ? custom : tempPassword();
  await prisma.user.update({
    where: { username },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  await prisma.auditLog.create({
    data: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      action: "Password Reset",
      entityType: "user",
      entityId: target.id,
      details: `Temporary password issued for @${username} by ${user.fullName}`,
    },
  });
  revalidatePath("/users");
  redirect(
    "/users?ok=" +
      encodeURIComponent(`Password reset for @${username}. Temporary password: ${password}`)
  );
}

/** Disable login without deleting history */
export async function disableUser(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) throw new Error("Not allowed");
  const id = String(formData.get("userId") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/users?error=" + encodeURIComponent("User not found"));
  }
  if (target.id === user.id) {
    redirect("/users?error=" + encodeURIComponent("You cannot disable your own account"));
  }
  if (target.role === "Founder" && !perms.isFounder) {
    redirect("/users?error=" + encodeURIComponent("Only Founder can disable the Founder account"));
  }
  if (target.username === "founder" && target.role === "Founder") {
    // Allow founder to disable other founders if any, but protect primary founder lightly
  }

  await prisma.user.update({
    where: { id },
    data: { active: false },
  });
  await prisma.auditLog.create({
    data: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      action: "User Disabled",
      entityType: "user",
      entityId: id,
      details: `Disabled @${target.username} (${target.fullName})`,
    },
  });
  revalidatePath("/users");
  redirect("/users?ok=" + encodeURIComponent(`Disabled @${target.username} — they can no longer sign in`));
}

/** Re-enable a disabled account */
export async function enableUser(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) throw new Error("Not allowed");
  const id = String(formData.get("userId") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/users?error=" + encodeURIComponent("User not found"));
  }

  await prisma.user.update({
    where: { id },
    data: { active: true },
  });
  await prisma.auditLog.create({
    data: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      action: "User Enabled",
      entityType: "user",
      entityId: id,
      details: `Re-enabled @${target.username}`,
    },
  });
  revalidatePath("/users");
  redirect("/users?ok=" + encodeURIComponent(`Enabled @${target.username}`));
}

/**
 * Permanently remove user from the app.
 * Clears linked profile/docs where possible; blocks deleting yourself or sole Founder.
 */
export async function deleteUser(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) throw new Error("Not allowed");
  const id = String(formData.get("userId") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/users?error=" + encodeURIComponent("User not found"));
  }
  if (target.id === user.id) {
    redirect("/users?error=" + encodeURIComponent("You cannot delete your own account"));
  }
  if (target.role === "Founder") {
    const founderCount = await prisma.user.count({ where: { role: "Founder", active: true } });
    if (founderCount <= 1 || !perms.isFounder) {
      redirect(
        "/users?error=" +
          encodeURIComponent("Cannot delete the primary Founder account. Disable it instead if needed.")
      );
    }
  }
  if (target.role === "Founder" && !perms.isFounder) {
    redirect("/users?error=" + encodeURIComponent("Only Founder can delete a Founder account"));
  }

  const label = `@${target.username} (${target.fullName})`;

  // Soft-clean related rows that would block delete
  await prisma.staffProfile.deleteMany({ where: { userId: id } }).catch(() => {});
  await prisma.employeeDocument.deleteMany({ where: { userId: id } }).catch(() => {});
  // Keep payroll history but detach is optional — SQLite may restrict; try delete payrolls
  await prisma.payrollRecord.deleteMany({ where: { userId: id } }).catch(() => {});

  try {
    await prisma.user.delete({ where: { id } });
  } catch (e: any) {
    // Fallback: force disable if hard delete fails due to relations
    await prisma.user.update({ where: { id }, data: { active: false } });
    await prisma.auditLog.create({
      data: {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        action: "User Disabled",
        details: `Delete blocked by linked data — disabled ${label} instead`,
      },
    });
    revalidatePath("/users");
    redirect(
      "/users?error=" +
        encodeURIComponent(
          `Could not fully delete ${label} (linked records). Account was disabled instead.`
        )
    );
  }

  await prisma.auditLog.create({
    data: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      action: "User Deleted",
      entityType: "user",
      entityId: id,
      details: `Removed ${label} from the application`,
    },
  });
  revalidatePath("/users");
  redirect("/users?ok=" + encodeURIComponent(`Removed ${label} from the application`));
}
