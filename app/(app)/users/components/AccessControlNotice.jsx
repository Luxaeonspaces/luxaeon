export default function AccessControlNotice() {
  return (
    <div className="glass-card space-y-2 p-4 text-sm text-gray-600">
      <p className="font-semibold text-brown">Access control</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Disable</strong> — blocks login; keeps history (recommended first step)
        </li>
        <li>
          <strong>Enable</strong> — restores login for a disabled user
        </li>
        <li>
          <strong>Delete</strong> — permanently removes the account from the app (cannot delete yourself or the last Founder)
        </li>
      </ul>
    </div>
  );
}