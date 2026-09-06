export default function LiveSessionFlags({ user, perms }) {
  return (
    <div className="glass-card p-5 text-sm">
      <p className="font-semibold text-brown">Your live session flags</p>
      <pre className="mt-2 overflow-auto rounded-xl bg-whitesmoke p-3 text-xs">
        {JSON.stringify(
          {
            user: user.fullName,
            role: user.role,
            department: user.department,
            ...Object.fromEntries(Object.entries(perms).filter(([k]) => k.startsWith("can") || k.startsWith("is"))),
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}