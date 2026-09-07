import AmountInput from "@/components/AmountInput";

export default function ProjectNewPaymentForm({ recordProjectPaymentAction, formKey }) {
  return (
    <form
      action={recordProjectPaymentAction}
      key={formKey}
      className="grid gap-2 border-t border-brown/30 p-4 md:grid-cols-2"
      encType="multipart/form-data"
    >
      <p className="md:col-span-2 text-sm font-semibold text-brown">Record new payment (receipt required)</p>
      <div>
        <AmountInput name="amount" placeholder="Payment amount (₦) *" required />
      </div>
      <input name="note" className="input" placeholder="Note e.g. 50% deposit" />
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">Payment receipt *</label>
        <input name="receipt" type="file" accept="image/*,.pdf" required className="text-sm" />
      </div>
      <button type="submit" className="btn-primary md:col-span-2">
        Record payment with receipt
      </button>
    </form>
  );
}