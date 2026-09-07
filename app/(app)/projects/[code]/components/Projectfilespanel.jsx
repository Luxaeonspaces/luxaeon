export default function ProjectFilesPanel({ project }) {
  return (
    <>
      <div className="glass-card p-4">
        <h2 className="mb-2 font-semibold text-brown">Download project history</h2>
        <p className="mb-3 text-xs text-gray-500">Payments, notes and activity for this project</p>
        <div className="flex flex-wrap gap-2">
          <a
            className="rounded-xl border border-brown/50 bg-brown/10 px-3 py-2 text-xs font-semibold text-brown"
            href={`/api/export/project-history?projectCode=${encodeURIComponent(project.projectCode)}&format=csv`}
          >
            History Excel
          </a>
          <a
            className="rounded-xl border border-brown/50 bg-brown/10 px-3 py-2 text-xs font-semibold text-brown"
            href={`/api/export/project-history?projectCode=${encodeURIComponent(project.projectCode)}&format=pdf`}
          >
            History PDF
          </a>
          <a
            className="rounded-xl border border-brown/50 bg-brown/10 px-3 py-2 text-xs font-semibold text-brown"
            href={`/api/export/project-history?projectCode=${encodeURIComponent(project.projectCode)}&format=word`}
          >
            History Word
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-2 font-semibold text-brown">Archive files ({project.files.length})</h3>
          <ul className="space-y-2 text-sm">
            {project.files.map((f) => (
              <li key={f.id} className="flex justify-between gap-2 border-b border-brown/20 pb-2">
                <span>{f.originalName || f.filename}</span>
                <a className="text-brown underline" href={`/api/files/uploads/${f.filename}`}>
                  Download
                </a>
              </li>
            ))}
            {project.files.length === 0 && <li className="text-gray-500">No files yet</li>}
          </ul>
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-2 font-semibold text-brown">Client portal docs ({project.clientDocs.length})</h3>
          <ul className="space-y-2 text-sm">
            {project.clientDocs.map((f) => (
              <li key={f.id} className="flex justify-between gap-2 border-b border-brown/20 pb-2">
                <span>{f.originalName || f.filename}</span>
                <a className="text-brown underline" href={`/api/files/client/${f.filename}`}>
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}