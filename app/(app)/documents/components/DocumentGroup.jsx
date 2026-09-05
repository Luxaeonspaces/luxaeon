import DocumentCard from "./DocumentCard";

export default function DocumentGroup({
  title,
  templates,
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-burgundy">
        {title}
      </h2>

      <div className="glass-card grid gap-3 p-5 sm:grid-cols-2">
        {templates.map((file) => (
          <DocumentCard
            key={file}
            file={file}
          />
        ))}
      </div>
    </section>
  );
}