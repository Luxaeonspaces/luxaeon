import Link from "next/link";
import { getTransactions } from "./finance-data";

export default async function TransactionColumn({
  title,
  type,
}) {
  const transactions = await getTransactions();

  const rows = transactions.filter(
    (transaction) => transaction.type === type
  );

  const downloadCsv =
    `/api/finance/export?format=csv&type=${type}`;

  const downloadPdf =
    `/api/finance/export?format=pdf&type=${type}`;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/30 px-4 py-3">
        <h2 className="font-semibold text-burgundy">
          {title}
        </h2>

        <div className="flex flex-wrap gap-2">
          <a
            href={downloadCsv}
            className="rounded-lg border border-gold/40 px-3 py-1 text-xs font-semibold text-burgundy"
          >
            Download {title} CSV
          </a>

          <a
            href={downloadPdf}
            className="rounded-lg border border-gold/40 px-3 py-1 text-xs font-semibold text-burgundy"
          >
            Download {title} PDF
          </a>
        </div>
      </div>

      <div className="table-scroll">
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
            {rows.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-gold/20"
              >
                <td className="px-4 py-2 font-mono text-xs">
                  {transaction.txnId}
                </td>

                <td className="px-4 py-2">
                  {transaction.date}
                </td>

                <td className="px-4 py-2">
                  {transaction.description}
                </td>

                <td className="px-4 py-2">
                  {transaction.salesPersonName || "—"}
                </td>

                <td className="px-4 py-2">
                  ₦{transaction.amount.toLocaleString()}
                </td>

                <td className="px-4 py-2">
                  <Link
                    href={`/finance/${transaction.id}`}
                    className="text-burgundy underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No {title.toLowerCase()} yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}