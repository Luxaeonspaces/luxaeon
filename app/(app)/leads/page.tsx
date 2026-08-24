import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createLead } from "./actions";

export default async function LeadsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { user, perms } = await requireUser();
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const salesPeople = await prisma.user.findMany({
    where: {
      active: true,
      OR: [
        { department: "Sales & Marketing" },
        { department: "Sales" },
        { department: "Marketing" },
      ],
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Leads & Sales</h1>
        <p className="relative z-10 text-sm text-white/80">Each lead is matched to a marketer for target tracking</p>
      </div>

      <form key={searchParams?.ok || "lead-create"} action={createLead} className="glass-card grid gap-3 p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 font-display font-semibold text-burgundy">Add lead</h2>
        <input name="fullName" className="input" placeholder="Full name *" required />
        <input name="phone" className="input" placeholder="Phone" />
        <input name="location" className="input" placeholder="Location" />
        <select name="source" className="input">
          {["Instagram", "TikTok", "Referral", "WhatsApp", "Website", "Other"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select name="status" className="input">
          {["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost", "Nurture"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select name="ownerUserId" className="input" defaultValue={perms.isSales ? user.id : ""}>
          <option value="">Sales owner (optional)</option>
          {salesPeople.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
        <textarea name="notes" className="input md:col-span-2" placeholder="Notes" rows={2} />
        <button type="submit" className="btn-primary md:col-span-2">
          Save lead
        </button>
      </form>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Sales owner</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-gold/20">
                <td className="px-4 py-2 font-medium">{l.fullName}</td>
                <td className="px-4 py-2">{l.phone}</td>
                <td className="px-4 py-2">{l.source}</td>
                <td className="px-4 py-2">{l.status}</td>
                <td className="px-4 py-2 text-burgundy">{l.ownerName || "—"}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{l.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
