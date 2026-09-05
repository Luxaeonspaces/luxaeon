import { getLeads } from "./leads-data";

export default async function LeadTable() {
  const leads = await getLeads();

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Source</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Sales owner</th>
            {/* <th className="px-4 py-2">Message / Notes</th> */}
            <th className="px-4 py-2">Created</th>
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

              {/* <td className="max-w-xs px-4 py-2">
                {lead.notes ? (
                  <span
                    className="block truncate"
                    title={lead.notes}
                  >
                    {lead.notes}
                  </span>
                ) : (
                  "—"
                )}
              </td> */}

              <td className="px-4 py-2 text-xs text-gray-500">
                {lead.createdAt.toISOString().slice(0, 10)}
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