import { getPerms } from "@/lib/rbac";

function labelFor(role, department) {
  if (role === "Founder") return "Founder";
  return `${role === "Department Head" ? "Head of" : "Staff —"} ${department}`;
}

export default function PermissionMatrix({ user }) {
  if (!user) {
    return (
      <div className="glass-card p-4 text-sm text-gray-500">
        No user loaded.
      </div>
    );
  }

  const perms = getPerms(user);

  return (
    <div className="glass-card">
      <div className="rounded-t-2xl border-b border-gray-200 px-4 py-3 font-semibold text-brown">
        Your permissions — live from rbac.ts
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-gray-200 bg-white/95 overflow-hidden">
          <div className="bg-whitesmoke px-3 py-2 text-xs font-semibold uppercase text-gray-500">
            {labelFor(user.role, user.department)}
          </div>
          <pre className="overflow-x-auto px-3 py-2 text-xs leading-relaxed text-brown">
{JSON.stringify(perms, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}