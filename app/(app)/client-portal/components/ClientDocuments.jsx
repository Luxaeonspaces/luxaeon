export default function ClientDocuments({ docs }) {
  return (
    <div className="pt-2">
      <h3 className="font-semibold text-burgundy">
        Documents
      </h3>

      {docs.length === 0 && (
        <p className="text-sm text-gray-500">
          No documents yet
        </p>
      )}

      {docs.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {docs.map((document) => (
            <li key={document.id}>
              {document.originalName} · by{" "}
              {document.uploadedBy} (
              {document.uploadedByRole})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}