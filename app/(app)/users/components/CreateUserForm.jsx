import { DEPARTMENTS } from "@/lib/rbac";
import { createUser } from "../actions";

export default function CreateUserForm({ formKey }) {
  return (
    <form action={createUser} className="glass-card grid gap-3 p-5 md:grid-cols-2" key={formKey}>
      <h2 className="md:col-span-2 font-display font-semibold text-brown">Add staff</h2>
      <input name="username" className="input" placeholder="Username * (unique)" required autoComplete="off" />
      <input name="fullName" className="input" placeholder="Full name *" required autoComplete="off" />
      <input name="password" type="text" className="input" placeholder="Password (optional if temp checked)" autoComplete="new-password" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="useTempPassword" defaultChecked />
        Generate temporary password automatically
      </label>
      <select name="role" className="input">
        <option>Staff</option>
        <option>Department Head</option>
      </select>
      <select name="department" className="input">
        {DEPARTMENTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <button type="submit" className="btn-primary md:col-span-2">
        Create account
      </button>
    </form>
  );
}