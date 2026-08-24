import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ONBOARDING_STEPS } from "@/lib/rbac";
import { startOnboarding, updateOnboarding } from "./actions";

export default async function OnboardingPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();
  if (!perms.canManageOnboarding) redirect("/dashboard");

  const staff = await prisma.user.findMany({ where: { active: true }, orderBy: { fullName: "asc" } });
  const lists = await prisma.onboardingChecklist.findMany({ orderBy: { startedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Employee Onboarding</h1>
        <p className="relative z-10 text-sm text-white/80">Checklist workflow for new hires</p>
      </div>

      <form key={searchParams?.ok || "onboard"} action={startOnboarding} className="glass-card flex flex-wrap gap-3 p-5">
        <select name="userId" className="input max-w-xs" required>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName} · {s.department}
            </option>
          ))}
        </select>
        <input name="notes" className="input flex-1" placeholder="Onboarding notes" />
        <button type="submit" className="btn-primary">
          Start onboarding
        </button>
      </form>

      <div className="space-y-4">
        {lists.map((o) => {
          const done = ONBOARDING_STEPS.filter((s) => (o as any)[s.key]).length;
          const pct = Math.round((done / ONBOARDING_STEPS.length) * 100);
          return (
            <div key={o.id} className="glass-card p-5">
              <div className="mb-2 flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold text-burgundy">{o.employeeName}</p>
                  <p className="text-xs text-gray-500">
                    {o.status} · Started by {o.startedBy} · {pct}% complete
                  </p>
                </div>
              </div>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-cream">
                <div className="h-full rounded-full bg-burgundy" style={{ width: `${pct}%` }} />
              </div>
              <form action={updateOnboarding} className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                <input type="hidden" name="id" value={o.id} />
                {ONBOARDING_STEPS.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={s.key} defaultChecked={Boolean((o as any)[s.key])} />
                    {s.label}
                  </label>
                ))}
                <textarea name="notes" className="input sm:col-span-2 md:col-span-3" rows={2} defaultValue={o.notes || ""} />
                <button type="submit" className="btn-primary sm:col-span-2 md:col-span-3">
                  Save checklist
                </button>
              </form>
            </div>
          );
        })}
        {lists.length === 0 && <p className="text-gray-500">No onboarding workflows yet</p>}
      </div>
    </div>
  );
}
