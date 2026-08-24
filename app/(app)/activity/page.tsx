import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  const { perms } = await requireUser();
  if (!perms.canSeeAllActivity) redirect("/dashboard");

  const activities = await prisma.workActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  const byPerson: Record<string, number> = {};
  for (const a of activities) {
    byPerson[a.fullName] = (byPerson[a.fullName] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Team Activity</h1>
        <p className="relative z-10 text-sm text-white/80">Founder view — projects, leads, and work across the team</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(byPerson)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count]) => (
            <div key={name} className="glass-card p-4 text-center">
              <div className="font-display text-xl font-bold text-burgundy">{count}</div>
              <div className="text-xs text-gray-500">{name}</div>
            </div>
          ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Dept</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id} className="border-t border-gold/20">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{a.createdAt.toISOString().slice(0, 16)}</td>
                <td className="px-4 py-2">{a.fullName}</td>
                <td className="px-4 py-2">{a.department || "—"}</td>
                <td className="px-4 py-2 font-medium text-burgundy">{a.action}</td>
                <td className="px-4 py-2 text-gray-600">{a.details || a.entityId || "—"}</td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No activity logged yet — create leads, projects, or outflow requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
