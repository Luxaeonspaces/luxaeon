import SubmitButton from "@/app/components/SubmitButton";
import Link from "next/link";
import { requestLeave } from "../../leave/actions";
import { getMyLeaves } from "./my-space-data";

export default async function LeaveSection({
  userId,
  message,
}) {
  const leaves = await getMyLeaves(userId);

  return (
    <section className="glass-card p-5">
      <h2 className="mb-3 font-display font-semibold text-burgundy">
        Request leave
      </h2>

      <form
        key={message || "leave-ms"}
        action={requestLeave}
        className="grid gap-3 md:grid-cols-2"
      >
        <input
          type="hidden"
          name="returnTo"
          value="/my-space"
        />

        <label className="text-sm">
          <span className="text-xs text-gray-500">
            Start
          </span>

          <input
            name="startDate"
            type="date"
            className="input"
            required
          />
        </label>

        <label className="text-sm">
          <span className="text-xs text-gray-500">
            End
          </span>

          <input
            name="endDate"
            type="date"
            className="input"
            required
          />
        </label>

        <textarea
          name="reason"
          className="input md:col-span-2"
          rows={2}
          placeholder="Reason"
        />

        <SubmitButton className="btn-primary md:col-span-2" pendingText="Submitting leave...">
          Submit leave (to your HOD)
        </SubmitButton>
      </form>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-1">Dates</th>
              <th className="py-1">Days</th>
              <th className="py-1">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaves.slice(0, 8).map((leave) => (
              <tr
                key={leave.id}
                className="border-t border-gold/20"
              >
                <td className="py-1">
                  {leave.startDate} → {leave.endDate}
                </td>

                <td className="py-1">
                  {leave.days}
                </td>

                <td className="py-1">
                  {leave.status}
                </td>
              </tr>
            ))}

            {leaves.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-3 text-gray-500"
                >
                  No leave yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link
        href="/leave"
        className="mt-2 inline-block text-sm text-burgundy underline"
      >
        Full leave page →
      </Link>
    </section>
  );
}