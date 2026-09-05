import { requestLeave } from "../actions";

export default function LeaveRequestForm({ message }) {
  return (
    <form
      action={requestLeave}
      key={message || "leave-request"}
      className="glass-card grid gap-3 p-5 md:grid-cols-2"
    >
      <h2 className="md:col-span-2 font-semibold text-burgundy">
        Request leave
      </h2>

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

      <button
        type="submit"
        className="btn-primary md:col-span-2"
      >
        Submit to Head of Department
      </button>
    </form>
  );
}