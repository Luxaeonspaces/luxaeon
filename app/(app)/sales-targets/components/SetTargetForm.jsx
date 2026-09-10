import AmountInput from "@/app/components/AmountInput";
import SubmitButton from "@/app/components/SubmitButton";
import { getAllUsers } from "@/lib/cachedQueries";
import { setTarget } from "../actions";

export default async function SetTargetForm({ formKey }) {
  const allUsers = await getAllUsers();
  const salesStaff = allUsers
    .filter((u) => u.active && ["Sales & Marketing", "Sales", "Marketing"].includes(u.department || ""))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <form key={formKey} action={setTarget} className="glass-card grid gap-3 p-5 md:grid-cols-2">
      <h2 className="md:col-span-2 font-semibold text-brown">Set target</h2>
      <select name="userId" className="input" required>
        {salesStaff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName}
          </option>
        ))}
      </select>
      <input name="period" className="input" placeholder="Period e.g. August 2026" required />
      <div>
        <AmountInput name="targetAmount" placeholder="Revenue target (₦)" required />
      </div>
      <input name="leadsTarget" type="number" className="input" placeholder="Leads target" />
      <SubmitButton className="btn-primary md:col-span-2" pendingText="Saving target...">
        Save target
      </SubmitButton>
    </form>
  );
}