import SubmitButton from "@/app/components/SubmitButton";
import { preparePayroll } from "../actions";

export default function PreparePayrollForm({ formKey, preparedBy }) {
  return (
    <form key={formKey} action={preparePayroll} className="glass-card space-y-3 p-5">
      <h2 className="font-semibold text-brown">Prepare draft payroll</h2>
      <input name="period" className="input" placeholder="Period e.g. August 2026" required />
      <SubmitButton className="btn-primary" pendingText="Generating...">
        Generate draft for all active staff
      </SubmitButton>
      <p className="text-xs text-gray-500">Prepared by {preparedBy}</p>
    </form>
  );
}