import { getAllUsers } from "@/lib/cachedQueries";
import { disableUser, enableUser, deleteUser } from "../actions";

export default async function UsersTable({ currentUserId }) {
  const allUsers = await getAllUsers();
  const users = [...allUsers].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    if (a.role !== b.role) return a.role.localeCompare(b.role);
    return a.fullName.localeCompare(b.fullName);
  });

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
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
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id} className={`border-t border-gray-200 ${!u.active ? "bg-gray-50 opacity-80" : ""}`}>
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
  );
}