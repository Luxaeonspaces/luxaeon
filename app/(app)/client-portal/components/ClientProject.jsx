import ClientDocuments from "./ClientDocuments";

export default function ClientProject({ project, docs }) {
  return (
    <div className="glass-card space-y-3 p-5">
      <p className="text-lg font-semibold text-burgundy">
        Welcome, {project.clientName}
      </p>

      <p>
        <strong>Stage:</strong> {project.stage}
      </p>

      <p>
        <strong>Handover:</strong>{" "}
        {project.targetHandover || "TBC"}
      </p>

      <p>
        <strong>Location:</strong>{" "}
        {project.location || "—"}
      </p>

      <ClientDocuments docs={docs} />
    </div>
  );
}