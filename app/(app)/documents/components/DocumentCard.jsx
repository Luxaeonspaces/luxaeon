export default function DocumentCard({ file }) {
  const isExcel = file.endsWith(".xlsx");

  const fileName = file
    .replace(/_/g, " ")
    .replace(/\.\w+$/, "");

  const fileUrl = `/templates/${encodeURIComponent(file)}`;

  return (
    <a
      href={fileUrl}
      download={file}
      className="flex items-center justify-between gap-2 rounded-xl border border-gold/40 bg-white/70 px-4 py-3 text-sm font-medium text-burgundy transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span>
        ⬇️ {fileName}
      </span>

      <span className="text-xs text-gray-400">
        {isExcel ? "Excel" : "Word"}
      </span>
    </a>
  );
}