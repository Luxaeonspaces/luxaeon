import { DEPARTMENTS } from "@/lib/rbac";
import { updateUser } from "../actions";

export default function UpdateUserForm({ formKey }) {
  return (
    <form action={updateUser} className="glass-card grid gap-3 p-5 md:grid-cols-4" key={formKey}>
      <h2 className="md:col-span-4 font-display font-semibold text-brown">Edit username / role / department</h2>
      <input name="username" className="input" placeholder="Current username" required autoComplete="off" />
      <input name="newUsername" className="input" placeholder="New username (optional)" autoComplete="off" />
      <select name="role" className="input">
        <option>Staff</option>
        <option>Department Head</option>
        <option>Founder</option>
      </select>
      <select name="department" className="input">
        {DEPARTMENTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <select name="active" className="input">
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
      <button type="submit" className="btn-primary md:col-span-4">
        Update user
      </button>
    </form>
  );
}