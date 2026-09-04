import { resetPassword } from "../actions";

export default function ResetPasswordForm({ formKey }) {
  return (
    <form action={resetPassword} className="glass-card grid gap-3 p-5 md:grid-cols-2" key={formKey}>
      <h2 className="md:col-span-2 font-display font-semibold text-brown">Reset password</h2>
      <input name="username" className="input" placeholder="Username *" required autoComplete="off" />
      <input name="newPassword" type="text" className="input" placeholder="Optional custom password (min 6)" autoComplete="new-password" />
      <button type="submit" className="btn-primary md:col-span-2">
        Reset &amp; show temporary password
      </button>
    </form>
  );
}