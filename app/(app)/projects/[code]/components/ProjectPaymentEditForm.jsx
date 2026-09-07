import AmountInput from "@/components/AmountInput";

export default function ProjectPaymentEditForm({ payment, editProjectPaymentAction }) {
  return (
    <form
      action={editProjectPaymentAction}
      className="grid gap-2 rounded-xl border border-brown/30 bg-white/50 p-3 md:grid-cols-5"
    >
      <input type="hidden" name="txnId" value={payment.id} />
      <div className="text-xs text-gray-500 md:col-span-5">
        Edit {payment.txnId}
        {payment.documents?.length ? ` · ${payment.documents.length} receipt(s)` : " · no receipt yet"}
        {payment.documents?.map((d) => (
          <a
            key={d.id}
            className="ml-2 text-brown underline"
            href={`/api/files/finance/${d.filename}`}
            target="_blank"
          >
            View receipt
          </a>
        ))}
      </div>
      <div>
        <AmountInput name="amount" defaultValue={payment.amount} />
      </div>
      <input name="description" className="input md:col-span-2" defaultValue={payment.description || ""} />
      <input name="receipt" type="file" accept="image/*,.pdf" className="text-xs" />
      <button type="submit" className="rounded-xl border border-brown/50 px-3 py-2 text-xs font-semibold text-brown">
        Save correction
      </button>
    </form>
  );
}