import AmountInput from "@/components/AmountInput";
import { preparePayroll } from "../actions";

export default function GeneratePayrollForm({ formKey }) {
  return (
    <form action={preparePayroll} className="glass-card grid gap-3 p-5 md:grid-cols-3" key={formKey}>
      <h2 className="md:col-span-3 font-semibold text-brown">Generate payroll batch</h2>
      <input name="period" className="input" placeholder="Period e.g. August 2026" required />
      <div>
        <AmountInput name="allowances" placeholder="Default allowances (₦)" />
      </div>
      <div>
        <AmountInput name="deductions" placeholder="Default deductions (₦)" />
      </div>
      <button type="submit" className="btn-primary md:col-span-3">
        Generate &amp; send to Founder
      </button>
      <p className="md:col-span-3 text-xs text-gray-500">
        Creates one batch with all salaried staff. Cumulative total posts once when Finance disburses.
      </p>
    </form>
  );
}