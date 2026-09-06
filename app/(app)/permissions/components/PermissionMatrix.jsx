import { getPerms, DEPARTMENTS } from "@/lib/rbac";

function labelFor(role, department) {
  if (role === "Founder") return "Founder";
  return `${role === "Department Head" ? "Head of" : "Staff —"} ${department}`;
}

export default function PermissionMatrix() {
  const samples = [
    { role: "Founder", department: "Executive" },
    ...DEPARTMENTS.flatMap((department) => [
      { role: "Department Head", department },
      { role: "Staff", department },
    ]),
  ];

  const columns = samples.map((s) => ({
    label: labelFor(s.role, s.department),
    perms: getPerms({ id: "sample", username: "sample", fullName: "Sample", role: s.role, department: s.department }),
  }));

  const capabilityKeys = Object.keys(columns[0].perms).filter((k) => k.startsWith("can"));

  return (
    <div className="glass-card">
      <div className="rounded-t-2xl border-b border-gray-200 px-4 py-3 font-semibold text-brown">
        Permission matrix — live from rbac.ts (scroll right for all roles)
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
            <tr>
              <th className="sticky left-0 top-0 z-30 bg-whitesmoke px-4 py-2">Capability</th>
              {columns.map((c) => (
                <th key={c.label} className="sticky top-0 z-20 whitespace-nowrap bg-whitesmoke px-3 py-2">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilityKeys.map((key) => (
              <tr key={key} className="border-t border-gray-200">
                <td className="sticky left-0 z-10 bg-white/95 px-4 py-2 font-medium">{key}</td>
                {columns.map((c) => (
                  <td key={c.label} className="px-3 py-2 text-center">
                    {c.perms[key] ? <span className="text-brown">✓</span> : <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}