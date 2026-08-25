import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { DEPARTMENTS } from "@/lib/rbac";
import {
  createUser,
  updateUser,
  resetPassword,
  disableUser,
  enableUser,
  deleteUser,
} from "./actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { error?: string; ok?: string };
}) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) redirect("/dashboard");

  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { fullName: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">User Management</h1>
        <p className="relative z-10 text-sm text-white/80">
          Founder &amp; IT staff · edit usernames, create, disable, or remove accounts
        </p>
      </div>

      {searchParams?.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>
      )}
      {searchParams?.ok && (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-burgundy">{searchParams.ok}</p>
      )}

      <div className="glass-card space-y-2 p-4 text-sm text-gray-600">
        <p className="font-semibold text-burgundy">Access control</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Disable</strong> — blocks login; keeps history (recommended first step)
          </li>
          <li>
            <strong>Enable</strong> — restores login for a disabled user
          </li>
          <li>
            <strong>Delete</strong> — permanently removes the account from the app (cannot delete yourself or the last Founder)
          </li>
        </ul>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === user.id;
              return (
                <tr key={u.id} className={`border-t border-gold/20 ${!u.active ? "bg-gray-50 opacity-80" : ""}`}>
                  <td className="px-4 py-2 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-2">{u.fullName}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{u.department}</td>
                  <td className="px-4 py-2">
                    {u.active ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">Active</span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {u.active ? (
                        <form action={disableUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button
                            type="submit"
                            disabled={isSelf}
                            className="rounded-lg border border-amber-300 px-2 py-1 text-xs font-medium text-amber-900 disabled:opacity-40"
                            title={isSelf ? "Cannot disable yourself" : "Disable login"}
                          >
                            Disable
                          </button>
                        </form>
                      ) : (
                        <form action={enableUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-800">
                            Enable
                          </button>
                        </form>
                      )}
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          disabled={isSelf}
                          className="rounded-lg border border-red-300 px-2 py-1 text-xs font-medium text-red-700 disabled:opacity-40"
                          title={isSelf ? "Cannot delete yourself" : "Permanently remove"}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form action={createUser} className="glass-card grid gap-3 p-5 md:grid-cols-2" key={searchParams?.ok || "create"}>
        <h2 className="md:col-span-2 font-display font-semibold text-burgundy">Add staff</h2>
        <input name="username" className="input" placeholder="Username * (unique)" required autoComplete="off" />
        <input name="fullName" className="input" placeholder="Full name *" required autoComplete="off" />
        <input name="password" type="text" className="input" placeholder="Password (optional if temp checked)" autoComplete="new-password" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="useTempPassword" defaultChecked />
          Generate temporary password automatically
        </label>
        <select name="role" className="input">
          <option>Staff</option>
          <option>Department Head</option>
        </select>
        <select name="department" className="input">
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary md:col-span-2">
          Create account
        </button>
      </form>

      <form action={resetPassword} className="glass-card grid gap-3 p-5 md:grid-cols-2" key={`reset-${searchParams?.ok || ""}`}>
        <h2 className="md:col-span-2 font-display font-semibold text-burgundy">Reset password</h2>
        <input name="username" className="input" placeholder="Username *" required autoComplete="off" />
        <input name="newPassword" type="text" className="input" placeholder="Optional custom password (min 6)" autoComplete="new-password" />
        <button type="submit" className="btn-primary md:col-span-2">
          Reset &amp; show temporary password
        </button>
      </form>

      <form action={updateUser} className="glass-card grid gap-3 p-5 md:grid-cols-4" key={`upd-${searchParams?.ok || ""}`}>
        <h2 className="md:col-span-4 font-display font-semibold text-burgundy">Edit username / role / department</h2>
        <input name="username" className="input" placeholder="Current username" required autoComplete="off" />
        <input name="newUsername" className="input" placeholder="New username (optional)" autoComplete="off" />
        <select name="role" className="input">
          <option>Staff</option>
          <option>Department Head</option>
          <option>Founder</option>
        </select>
        <select name="department" className="input">
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select name="active" className="input">
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <button type="submit" className="btn-primary md:col-span-4">
          Update user
        </button>
      </form>
    </div>
  );
}
