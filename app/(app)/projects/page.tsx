import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PROJECT_STAGES } from "@/lib/rbac";
import AmountInput from "@/components/AmountInput";
import { createProject, updateProjectStage } from "./actions";
import Link from "next/link";

export default async function ProjectsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();
  const projects = await prisma.project.findMany({
    where: { NOT: { OR: [{ status: "Completed" }, { stage: "Completed" }] } },
    orderBy: { updatedAt: "desc" },
  });
  const salesPeople = await prisma.user.findMany({
    where: {
      active: true,
      OR: [
        { department: "Sales & Marketing" },
        { department: "Sales" },
        { department: "Marketing" },
      ],
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Projects</h1>
        <p className="relative z-10 text-sm text-white/80">Pipeline · created by tracking</p>
      </div>

      <div className="glass-card flex flex-wrap gap-2 p-4">
        <span className="w-full text-sm font-semibold text-burgundy">Download project tracker</span>
        <a
          href="/api/export/project-tracker?format=csv"
          className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-semibold text-burgundy"
        >
          Tracker Excel
        </a>
        <a
          href="/api/export/project-tracker?format=pdf"
          className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-semibold text-burgundy"
        >
          Tracker PDF
        </a>
        <a
          href="/api/export/project-tracker?format=word"
          className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-semibold text-burgundy"
        >
          Tracker Word
        </a>
        <a
          href="/archive"
          className="rounded-xl border border-burgundy/40 bg-burgundy/10 px-3 py-2 text-xs font-semibold text-burgundy"
        >
          Project Archives →
        </a>
      </div>

      {perms.canCreateProjects && (
        <form key={searchParams?.ok || "create-project"} action={createProject} className="glass-card grid gap-3 p-5 md:grid-cols-2">
          <h2 className="md:col-span-2 font-display font-semibold text-burgundy">Create Project</h2>
          <input name="clientName" className="input" placeholder="Client name *" required />
          <input name="projectName" className="input" placeholder="Project name" />
          <input name="location" className="input" placeholder="Location" />
          <select name="stage" className="input" defaultValue="Lead">
            {PROJECT_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div>
            <AmountInput name="designFee" placeholder="Design fee (₦)" />
          </div>
          <div>
            <AmountInput name="amountPaid" placeholder="Amount paid (₦)" />
          </div>
          <select name="salesPersonId" className="input">
            <option value="">Sales person who brought client</option>
            {salesPeople.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <textarea name="notes" className="input md:col-span-2" placeholder="Notes" rows={2} />
          <button type="submit" className="btn-primary md:col-span-2">
            Create project (as {user.fullName})
          </button>
        </form>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/60 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Stage</th>
              <th className="px-4 py-2">Fee</th>
              <th className="px-4 py-2">Paid</th>
              <th className="px-4 py-2">Balance</th>
              <th className="px-4 py-2">Created by</th>
              <th className="px-4 py-2">Sales</th>
              <th className="px-4 py-2">Access</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const balance = Math.max(0, (p.designFee || 0) - (p.amountPaid || 0));
              return (
                <tr key={p.id} className="border-t border-gold/20">
                  <td className="px-4 py-2 font-medium">{p.projectCode}</td>
                  <td className="px-4 py-2">{p.clientName}</td>
                  <td className="px-4 py-2">{p.stage}</td>
                  <td className="px-4 py-2">₦{(p.designFee || 0).toLocaleString()}</td>
                  <td className="px-4 py-2">₦{(p.amountPaid || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium text-burgundy">₦{balance.toLocaleString()}</td>
                  <td className="px-4 py-2 text-gray-600">{p.createdBy || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{p.salesPersonName || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{p.clientAccessCode || "—"}</td>
                  <td className="px-4 py-2">
                    <Link href={`/projects/${p.projectCode}`} className="text-burgundy underline">
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
