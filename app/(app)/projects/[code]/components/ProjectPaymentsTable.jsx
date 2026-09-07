export default function ProjectPaymentsTable({ paymentTxns }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
        <tr>
          <th className="px-4 py-2">Date</th>
          <th className="px-4 py-2">Txn ID</th>
          <th className="px-4 py-2">Description</th>
          <th className="px-4 py-2">Amount</th>
          <th className="px-4 py-2">Recorded by</th>
          <th className="px-4 py-2">Receipt</th>
        </tr>
      </thead>
      <tbody>
        {paymentTxns.map((p) => (
          <tr key={p.id} className="border-t border-brown/20">
            <td className="px-4 py-2">{p.date}</td>
            <td className="px-4 py-2 font-mono text-xs">{p.txnId}</td>
            <td className="px-4 py-2">{p.description}</td>
            <td className="px-4 py-2">₦{p.amount.toLocaleString()}</td>
            <td className="px-4 py-2">{p.createdBy || "—"}</td>
            <td className="px-4 py-2 text-xs">
              {p.documents?.length
                ? p.documents.map((d) => (
                    <a
                      key={d.id}
                      className="block text-brown underline"
                      href={`/api/files/finance/${d.filename}`}
                      target="_blank"
                    >
                      {d.originalName || "Receipt"}
                    </a>
                  ))
                : "—"}
            </td>
          </tr>
        ))}
        {paymentTxns.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
              No payments recorded yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}