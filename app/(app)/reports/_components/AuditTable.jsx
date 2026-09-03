export default function AuditTable({ title, columns, rows, emptyMessage }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 font-semibold text-brown">{title}</div>
      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className="px-4 py-2">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-200">
                {columns.map((c) => (
                  <td key={c.header} className={`px-4 py-2 ${c.className || ""}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}