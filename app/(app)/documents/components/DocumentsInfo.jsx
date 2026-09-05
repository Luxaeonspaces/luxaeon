export default function DocumentsInfo() {
  return (
    <div className="glass-card space-y-2 p-5 text-sm text-gray-700">
      <p className="font-semibold text-burgundy">
        Where to download generated files
      </p>

      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Project → Documents & PDFs</strong> — Invoice, Proposal,
          Status, Handover (PDF + Word) and Project/Procurement Excel
        </li>

        <li>
          <strong>Payroll</strong> — Download all payroll (Excel) or per batch
        </li>

        <li>
          <strong>Procurement</strong> — Download all procurement (Excel)
        </li>

        <li>
          <strong>Finance</strong> — Income / Expense CSV & PDF
        </li>

        <li>
          <strong>This page</strong> — Original Word/Excel template files
          (blank)
        </li>
      </ul>
    </div>
  );
}