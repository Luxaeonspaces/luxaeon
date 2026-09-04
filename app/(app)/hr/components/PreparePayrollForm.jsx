import { preparePayroll } from "../actions";

export default function PreparePayrollForm({ formKey, preparedBy }) {
  return (
    <form key={formKey} action={preparePayroll} className="glass-card space-y-3 p-5">
      <h2 className="font-semibold text-brown">Prepare draft payroll</h2>
      <input name="period" className="input" placeholder="Period e.g. August 2026" required />
      <button type="submit" className="btn-primary">
        Generate draft for all active staff
      </button>
      <p className="text-xs text-gray-500">Prepared by {preparedBy}</p>
    </form>
  );
}