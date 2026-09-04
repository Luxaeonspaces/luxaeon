import { getAllUsers } from "@/lib/cachedQueries";

export default async function StaffTable() {
  const allUsers = await getAllUsers();
  const staff = allUsers
    .filter((u) => u.active)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Role / Dept</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Salary</th>
            <th className="px-4 py-2">Docs</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium">{s.fullName}</td>
              <td className="px-4 py-2">
                {s.role} · {s.department}
              </td>
              <td className="px-4 py-2">{s.profile?.jobTitle || "—"}</td>
              <td className="px-4 py-2">₦{(s.profile?.salaryAmount || 0).toLocaleString()}</td>
              <td className="px-4 py-2">{s.hrDocuments.length}</td>
              <td className="px-4 py-2">
                <a href={`/hr/${s.id}`} className="font-semibold text-brown underline">
                  Open profile
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}