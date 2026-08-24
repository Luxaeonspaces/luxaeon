import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getPerms, type SessionUser } from "./rbac";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const u = session.user as any;

  // Hard DB check so disabled users cannot continue any process
  if (u.id) {
    const fresh = await prisma.user.findUnique({ where: { id: String(u.id) } });
    if (!fresh) {
      redirect("/login?error=deleted");
    }
    if (!fresh.active) {
      redirect("/login?error=disabled");
    }
  } else if (u.active === false || u.role === "Inactive") {
    const reason = u.disabledReason === "DELETED" ? "deleted" : "disabled";
    redirect(`/login?error=${reason}`);
  }

  const user: SessionUser = {
    id: u.id,
    username: u.username,
    fullName: u.fullName || u.name,
    role: u.role,
    department: u.department,
  };

  // Inactive role has no permissions of value
  if (user.role === "Inactive") {
    redirect("/login?error=disabled");
  }

  return { user, perms: getPerms(user), session };
}

export async function optionalUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as any;
  if (u.active === false || u.role === "Inactive") return null;
  const user: SessionUser = {
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    department: u.department,
  };
  return { user, perms: getPerms(user) };
}
