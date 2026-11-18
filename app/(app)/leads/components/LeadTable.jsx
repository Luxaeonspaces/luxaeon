import { getLeads } from "./leads-data";
import EditLeadModal from "./EditLeadModal";
import DeleteLeadModal from "./DeleteLeadModal";

export default async function LeadTable({ salesPeople, canEdit, canDelete }) {
  const leads = await getLeads();

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Source</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Sales owner</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-t border-gold/20"
            >
              <td className="px-4 py-2 font-medium">
                {lead.fullName}
              </td>

              <td className="px-4 py-2">
                {lead.email || "—"}
              </td>

              <td className="px-4 py-2">
                {lead.phone || "—"}
              </td>

              <td className="px-4 py-2">
                {lead.source || "—"}
              </td>

              <td className="px-4 py-2">
                {lead.status}
              </td>

              <td className="px-4 py-2 text-burgundy">
                {lead.ownerName || "—"}
              </td>

              <td className="px-4 py-2 text-xs text-gray-500">
                {lead.createdAt.toISOString().slice(0, 10)}
              </td>

              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <EditLeadModal
                      lead={lead}
                      salesPeople={salesPeople}
                    />
                  )}
                  {canDelete && <DeleteLeadModal lead={lead} />}
                </div>
              </td>
            </tr>
          ))}

          {leads.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-6 text-center text-gray-500"
              >
                No leads yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
