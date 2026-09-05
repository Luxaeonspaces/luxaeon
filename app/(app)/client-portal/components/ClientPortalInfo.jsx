export default function ClientPortalInfo() {
  return (
    <div className="glass-card p-5 text-sm text-gray-600">
      <p className="font-semibold text-burgundy">
        Website embed
      </p>

      <p className="mt-1">
        Public link (no login):{" "}
        <a
          className="text-burgundy underline"
          href="/portal"
          target="_blank"
        >
          /portal
        </a>
        . Host online and link from luxaeonspaces.com to{" "}
        <code className="rounded bg-cream px-1">
          /client-portal
        </code>{" "}
        so clients can check progress on phone or laptop.
      </p>
    </div>
  );
}