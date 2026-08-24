import { requireUser } from "@/lib/session";
import { changePassword } from "./actions";

export default async function SettingsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user } = await requireUser();

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Settings</h1>
      </div>
      <div className="glass-card space-y-2 p-5 text-sm">
        <p>
          <strong>Logged in as:</strong> {user.fullName} ({user.role})
        </p>
        <p>
          <strong>Department:</strong> {user.department || "—"}
        </p>
        <p>
          <strong>Company:</strong> Luxaeon Spaces
        </p>
        <p>
          <strong>Founder:</strong> Oluwabukunmi OMISORE · +234 902 114 4350 · luxaeonspaces@gmail.com
        </p>
      </div>
      <form key={searchParams?.ok || "pwd"} action={changePassword} className="glass-card space-y-3 p-5">
        <h2 className="font-display font-semibold text-burgundy">Change my password</h2>
        <input name="current" type="password" className="input" placeholder="Current password" required />
        <input name="next" type="password" className="input" placeholder="New password (min 6)" required />
        <input name="confirm" type="password" className="input" placeholder="Confirm new password" required />
        <button type="submit" className="btn-primary">
          Update password
        </button>
      </form>
    </div>
  );
}
