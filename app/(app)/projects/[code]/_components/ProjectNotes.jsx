export default function ProjectNotes({ project, addNoteAction, formKey }) {
  return (
    <>
      <form key={formKey} action={addNoteAction} className="glass-card space-y-3 p-5">
        <h2 className="font-display font-semibold text-brown">Add internal note</h2>
        <textarea name="note" className="input" rows={3} required />
        <button type="submit" className="btn-primary">
          Save note
        </button>
      </form>

      <div className="glass-card p-5">
        <h2 className="mb-3 font-display font-semibold text-brown">Notes history</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {project.notesLog.map((n) => (
            <li key={n.id} className="border-b border-brown/20 pb-2">
              <span className="text-xs text-gray-400">{n.createdAt.toISOString().slice(0, 16)}</span>
              {n.createdBy ? ` · ${n.createdBy}` : ""} — {n.note}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}