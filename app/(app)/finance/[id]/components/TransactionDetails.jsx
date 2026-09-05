export default function TransactionDetails({ transaction }) {
  return (
    <div className="glass-card grid gap-3 p-5 text-sm md:grid-cols-2">
      <p>
        <strong>Type:</strong> {transaction.type}
      </p>

      <p>
        <strong>Amount:</strong> ₦{transaction.amount.toLocaleString()}
      </p>

      <p>
        <strong>Date:</strong> {transaction.date}
      </p>

      <p>
        <strong>Category:</strong> {transaction.category || "—"}
      </p>

      <p className="md:col-span-2">
        <strong>Description:</strong>{" "}
        {transaction.description || "—"}
      </p>

      <p>
        <strong>Project:</strong>{" "}
        {transaction.projectCode || "—"}
      </p>

      <p>
        <strong>Client:</strong>{" "}
        {transaction.clientName || "—"}
      </p>

      <p>
        <strong>Sales person:</strong>{" "}
        {transaction.salesPersonName || "—"}
      </p>

      <p>
        <strong>Recorded by:</strong>{" "}
        {transaction.createdBy || "—"}
      </p>
    </div>
  );
}