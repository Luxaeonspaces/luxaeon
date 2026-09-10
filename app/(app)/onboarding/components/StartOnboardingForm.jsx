import { getAllUsers } from "@/lib/cachedQueries";
import SubmitButton from "@/app/components/SubmitButton";
import { startOnboarding } from "../actions";

export default async function StartOnboardingForm({ formKey }) {
  const allUsers = await getAllUsers();
  const staff = allUsers
    .filter((u) => u.active)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <form key={formKey} action={startOnboarding} className="glass-card flex flex-wrap gap-3 p-5">
      <select name="userId" className="input max-w-xs" required>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName} · {s.department}
          </option>
        ))}
      </select>
      <input name="notes" className="input flex-1" placeholder="Onboarding notes" />
      <SubmitButton className="btn-primary" pendingText="Starting...">
        Start onboarding
      </SubmitButton>
    </form>
  );
}