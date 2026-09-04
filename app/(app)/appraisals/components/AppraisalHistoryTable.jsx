export default function AppraisalHistoryTable({ appraisals }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 font-semibold text-brown">Appraisal history</div>
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Employee</th>
            <th className="px-4 py-2">Period</th>
            <th className="px-4 py-2">Self</th>
            <th className="px-4 py-2">HR</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {appraisals.map((a) => (
            <tr key={a.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{a.employeeName}</td>
              <td className="px-4 py-2">{a.period}</td>
              <td className="px-4 py-2">{a.selfOverall || "—"}</td>
              <td className="px-4 py-2">{a.overallScore || "—"}</td>
              <td className="px-4 py-2">{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}