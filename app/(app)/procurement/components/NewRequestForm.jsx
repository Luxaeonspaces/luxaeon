import { prisma } from "@/lib/prisma";
import AmountInput from "@/components/AmountInput";
import { requestProcurement } from "../actions";

export default async function NewRequestForm({ formKey }) {
  const projects = await prisma.project.findMany({
    where: { status: "Active" },
    select: { projectCode: true, clientName: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <form key={formKey} action={requestProcurement} className="glass-card grid gap-3 p-5 md:grid-cols-2">
      <h2 className="md:col-span-2 font-semibold text-brown">New procurement request</h2>
      <input name="title" className="input" placeholder="What do you need? *" required />
      <select name="category" className="input">
        {["Materials", "Furniture", "Lighting", "Services", "Logistics", "Other"].map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <select name="projectCode" className="input">
        <option value="">No project link</option>
        {projects.map((p) => (
          <option key={p.projectCode} value={p.projectCode}>
            {p.projectCode} — {p.clientName}
          </option>
        ))}
      </select>
      <div>
        <AmountInput name="estimatedCost" placeholder="Estimated cost (₦)" />
      </div>
      <input name="vendorPreferred" className="input" placeholder="Preferred vendor" />
      <input name="payeeName" className="input" placeholder="Payee name" />
      <input name="payeeBankName" className="input" placeholder="Bank name" />
      <input name="payeeAccountName" className="input" placeholder="Account name" />
      <input name="payeeAccountNo" className="input" placeholder="Account number" />
      <textarea name="description" className="input md:col-span-2" rows={2} placeholder="Specs / details" />
      <button type="submit" className="btn-primary md:col-span-2">
        Submit request
      </button>
    </form>
  );
}