import { getTransactionAudits } from "./transaction-data";

export default async function TransactionAudit({
  transactionId,
  txnId,
}) {
  const audits = await getTransactionAudits(
    transactionId,
    txnId
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">
        Transaction audit trail
      </div>

      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>

          <tbody>
            {audits.map((audit) => (
              <tr
                key={audit.id}
                className="border-t border-gold/20"
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs">
                  {audit.createdAt.toISOString().slice(0, 19)}
                </td>

                <td className="px-4 py-2">
                  {audit.performedBy} ({audit.role})
                </td>

                <td className="px-4 py-2 font-medium text-burgundy">
                  {audit.action}
                </td>

                <td className="px-4 py-2 text-gray-600">
                  {audit.details || "—"}
                </td>
              </tr>
            ))}

            {audits.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No audit history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}