import { getActivities } from "./activity-data";

export default async function ActivitySummary() {
  const activities = await getActivities();

  const byPerson = {};

  for (const activity of activities) {
    byPerson[activity.fullName] =
      (byPerson[activity.fullName] || 0) + 1;
  }

  const summary = Object.entries(byPerson)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {summary.map(([name, count]) => (
        <div
          key={name}
          className="glass-card p-4 text-center"
        >
          <div className="font-display text-xl font-bold text-burgundy">
            {count}
          </div>

          <div className="text-xs text-gray-500">
            {name}
          </div>
        </div>
      ))}
    </div>
  );
}