import { PROJECT_STAGES } from "@/lib/rbac";
import AmountInput from "@/app/components/AmountInput";
import { getAllUsers } from "@/lib/cachedQueries";
import { createProject } from "../actions";

export default async function CreateProjectForm({ userFullName, formKey }) {
  const allUsers = await getAllUsers();
  const salesPeople = allUsers
    .filter((u) => u.active && ["Sales & Marketing", "Sales", "Marketing"].includes(u.department || ""))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <form key={formKey} action={createProject} className="glass-card grid gap-3 p-5 md:grid-cols-2">
      <h2 className="md:col-span-2 font-display font-semibold text-brown">Create Project</h2>
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
      <button type="submit" data-submit-trigger="true" className="btn-primary md:col-span-2">
        Create project (as {userFullName})
      </button>
    </form>
  );
}