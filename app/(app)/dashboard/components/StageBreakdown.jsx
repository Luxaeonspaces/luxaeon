import { prisma } from "@/lib/prisma";

export default async function StageBreakdown() {
  const stageGroups = await prisma.project.groupBy({
    by: ["stage"],
    where: { status: "Active" },
    _count: true,
  });

  return (
    <section className="glass-card p-5">
      <h2 className="mb-3 font-display font-semibold text-brown">Project stages (live)</h2>
      <div className="flex flex-wrap gap-2">
        {stageGroups.map((g) => (
          <span key={g.stage} className="rounded-full bg-brown/10 px-3 py-1 text-xs font-medium text-brown">
            {g.stage}: {g._count}
          </span>
        ))}
        {stageGroups.length === 0 && <span className="text-sm text-gray-500">No active projects</span>}
      </div>
    </section>
  );
}