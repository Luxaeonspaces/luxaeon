import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getPerms } from "./rbac";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { cache } from "react";

export const requireUser = cache(async function requireUser(options = {}) {
  const { refresh = false } = options;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const u = session.user;

  const user = {
    id: u.id,
    username: u.username,
    fullName: u.fullName || u.name || u.username,
    role: u.role,
    department: u.department,
  };

  if (user.role === "Inactive") {
    redirect("/login?error=disabled");
  }

  if (refresh && user.id) {
    const fresh = await prisma.user.findUnique({
      where: { id: String(user.id) },
    });

    if (!fresh) {
      redirect("/login?error=deleted");
    }

    if (!fresh.active) {
      redirect("/login?error=disabled");
    }

    const liveUser = {
      id: fresh.id,
      username: fresh.username,
      fullName: fresh.fullName,
      role: fresh.role,
      department: fresh.department,
    };

    return { user: liveUser, perms: getPerms(liveUser), session };
  }

  return { user, perms: getPerms(user), session };
});

export async function requireUserLive() {
  return requireUser({ refresh: true });
}

export async function optionalUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const u = session.user;

  if (u.active === false || u.role === "Inactive") return null;

  const user = {
    id: u.id,
    username: u.username,
    fullName: u.fullName || u.name || u.username,
    role: u.role,
    department: u.department,
  };

  return { user, perms: getPerms(user) };
}