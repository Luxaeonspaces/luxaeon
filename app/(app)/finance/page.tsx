import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FinancePage() {
  const { perms } = await requireUser();
  if (!perms.canSeeFinance) redirect("/dashboard");

  const txs = await prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const income = txs.filter((t) => t.type === "Income");
  const expense = txs.filter((t) => t.type === "Expense");
  const inc = income.reduce((a, t) => a + t.amount, 0);
  const exp = expense.reduce((a, t) => a + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Finance & Cashflow</h1>
        <p className="relative z-10 text-sm text-white/80">
          Income and expenses listed separately · audit reports live under Reports
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Income</div>
          <div className="font-display text-2xl font-bold text-burgundy">₦{inc.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Expenses</div>
          <div className="font-display text-2xl font-bold text-burgundy">₦{exp.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Net</div>
          <div className="font-display text-2xl font-bold text-burgundy">₦{(inc - exp).toLocaleString()}</div>
        </div>
      </div>

      <TxnColumn
        title="Income"
        rows={income}
        downloadCsv="/api/finance/export?format=csv&type=Income"
        downloadPdf="/api/finance/export?format=pdf&type=Income"
      />
      <TxnColumn
        title="Expenses"
        rows={expense}
        downloadCsv="/api/finance/export?format=csv&type=Expense"
        downloadPdf="/api/finance/export?format=pdf&type=Expense"
      />
    </div>
  );
}

function TxnColumn({
  title,
  rows,
  downloadCsv,
  downloadPdf,
}: {
  title: string;
  rows: any[];
  downloadCsv: string;
  downloadPdf: string;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/30 px-4 py-3">
        <h2 className="font-semibold text-burgundy">{title}</h2>
        <div className="flex gap-2">
          <a href={downloadCsv} className="rounded-lg border border-gold/40 px-3 py-1 text-xs font-semibold text-burgundy">
            Download {title} CSV
          </a>
          <a href={downloadPdf} className="rounded-lg border border-gold/40 px-3 py-1 text-xs font-semibold text-burgundy">
            Download {title} PDF
          </a>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Txn ID</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Sales person</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t border-gold/20">
              <td className="px-4 py-2 font-mono text-xs">{t.txnId}</td>
              <td className="px-4 py-2">{t.date}</td>
              <td className="px-4 py-2">{t.description}</td>
              <td className="px-4 py-2">{t.salesPersonName || "—"}</td>
              <td className="px-4 py-2">₦{t.amount.toLocaleString()}</td>
              <td className="px-4 py-2">
                <Link href={`/finance/${t.id}`} className="text-burgundy underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                No {title.toLowerCase()} yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
