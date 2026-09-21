const matrix = [
  ["View dashboard", "Yes", "Yes", "Yes"],
  ["Create / manage leads", "Yes", "Yes", "Yes"],
  ["Create projects", "Yes", "HOD / Design / IT", "Design staff"],
  ["Edit project details (fees/stage)", "Yes", "HOD + Finance staff", "No"],
  ["View Finance & Cashflow", "Yes", "Finance dept", "No"],
  ["Disburse funds / pay payroll", "No", "Head of Finance only", "No"],
  ["Request outflow (expense)", "Yes", "Yes", "Yes"],
  ["Approve outflow (department step)", "Yes", "Own dept HOD", "No"],
  ["Approve outflow (founder step)", "Yes", "No", "No"],
  ["Release outflow funds", "No", "Head of Finance only", "No"],
  ["Process procurement", "Yes", "Procurement dept", "No"],
  ["Sales targets", "Yes", "Sales HOD set / Sales view", "Sales only"],
  ["Appraisals manage", "Yes", "HR", "Self + acknowledge"],
  ["HOD appraisal approve", "Yes", "Own dept HOD", "No"],
  ["HR / payroll generate", "Yes", "HR", "No"],
  ["Payroll founder approve", "Yes", "No", "No"],
  ["Reports (finance/login/project)", "Yes", "All HODs", 'No — "can’t access data"'],
  ["User management", "Yes", "Head of IT", "No"],
  ["Team activity feed", "Yes", "No", "No"],
];

export default function PermissionMatrix() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3 font-semibold text-brown">
        Permission matrix
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Capability</th>
            <th className="px-4 py-2">Founder</th>
            <th className="px-4 py-2">Department Head / special</th>
            <th className="px-4 py-2">Staff</th>
          </tr>
        </thead>

        <tbody>
          {matrix.map((row) => (
            <tr key={row[0]} className="border-t border-gold/20">
              {row.map((cell) => (
                <td key={cell} className="px-4 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}