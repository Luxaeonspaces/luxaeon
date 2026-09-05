import { getActivities } from "./activity-data";

export default async function ActivityTable() {
  const activities = await getActivities();

  return (
    <div className="glass-card overflow-hidden">
      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Dept</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="border-t border-gold/20"
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs">
                  {activity.createdAt
                    .toISOString()
                    .slice(0, 16)}
                </td>

                <td className="px-4 py-2">
                  {activity.fullName}
                </td>

                <td className="px-4 py-2">
                  {activity.department || "—"}
                </td>

                <td className="px-4 py-2 font-medium text-burgundy">
                  {activity.action}
                </td>

                <td className="px-4 py-2 text-gray-600">
                  {activity.details ||
                    activity.entityId ||
                    "—"}
                </td>
              </tr>
            ))}

            {activities.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No activity logged yet — create leads,
                  projects, or outflow requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}