import { prisma } from "@/lib/prisma";
import { ONBOARDING_STEPS } from "@/lib/rbac";
import { updateOnboarding } from "../actions";

export default async function OnboardingChecklistList() {
  const lists = await prisma.onboardingChecklist.findMany({ orderBy: { startedAt: "desc" } });

  return (
    <div className="space-y-4">
      {lists.map((o) => {
        const done = ONBOARDING_STEPS.filter((s) => o[s.key]).length;
        const pct = Math.round((done / ONBOARDING_STEPS.length) * 100);
        return (
          <div key={o.id} className="glass-card p-5">
            <div className="mb-2 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold text-brown">{o.employeeName}</p>
                <p className="text-xs text-gray-500">
                  {o.status} · Started by {o.startedBy} · {pct}% complete
                </p>
              </div>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-whitesmoke">
              <div className="h-full rounded-full bg-brown" style={{ width: `${pct}%` }} />
            </div>
            <form action={updateOnboarding} className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              <input type="hidden" name="id" value={o.id} />
              {ONBOARDING_STEPS.map((s) => (
                <label key={s.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={s.key} defaultChecked={Boolean(o[s.key])} />
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
  );
}