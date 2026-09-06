import OutflowCard from "./OutflowCard";

export default function OutflowHistorySection({ rows, user, perms, cardActions }) {
  return (
    <section className="glass-card space-y-3 p-5">
      <h2 className="font-semibold text-brown">History (with supporting docs)</h2>
      {rows.map((r) => (
        <OutflowCard
          key={r.id}
          r={r}
          canUpload={r.requestedBy === user.fullName && r.status === "Pending Department"}
          canEdit={
            (r.status === "Pending Department" || r.status === "Recalled") &&
            (r.requestedBy === user.fullName ||
              r.requestedById === user.id ||
              perms.isFounder ||
              (perms.isHod && (!r.department || r.department === user.department)))
          }
          actions={cardActions}
        />
      ))}
    </section>
  );
}