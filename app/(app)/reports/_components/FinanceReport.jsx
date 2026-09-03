import { prisma } from "@/lib/prisma";
import AuditTable from "./AuditTable";
import { formatWAT } from "./format";

const financeColumns = (map) => [
  { header: "When", render: (a) => formatWAT(a.createdAt), className: "text-xs whitespace-nowrap" },
  { header: "Txn", render: (a) => a.txnId || "—", className: "font-mono text-xs" },
  { header: "Action", render: (a) => a.action, className: "text-brown" },
  {
    header: "Who · Dept",
    render: (a) => (
      <>
        {a.performedBy}
        <span className="block text-xs text-gray-500">
          {a.role} · {a.department || "—"}
        </span>
      </>
    ),
  },
  { header: "Details", render: (a) => a.details || "—", className: "text-gray-600" },
];

export default async function FinanceReport() {
  let audits = [];
  try {
    audits = await prisma.transactionAudit.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  } catch {
    audits = [];
  }
  const txs = await prisma.transaction.findMany({ take: 300 });
  const map = Object.fromEntries(txs.map((t) => [t.txnId, t]));
  const income = audits.filter((a) => map[a.txnId || ""]?.type === "Income" || (a.details || "").includes("Income"));
  const expense = audits.filter(
    (a) => map[a.txnId || ""]?.type === "Expense" || (a.details || "").includes("Expense") || a.action === "Linked Payroll"
  );

  const columns = financeColumns(map);

  return (
    <div className="space-y-4">
      <AuditTable title="Income — finance audit" columns={columns} rows={income} emptyMessage="No entries" />
      <AuditTable title="Expense — finance audit" columns={columns} rows={expense} emptyMessage="No entries" />
    </div>
  );
}