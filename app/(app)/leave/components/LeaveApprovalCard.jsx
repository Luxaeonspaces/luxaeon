import {
  hodApproveLeave,
  hrApproveLeave,
} from "../actions";

export function HodApprovalCard({ leave }) {
  return (
    <form
      action={hodApproveLeave}
      className="glass-card flex flex-wrap gap-2 p-4 text-sm"
    >
      <input
        type="hidden"
        name="id"
        value={leave.id}
      />

      <p className="w-full">
        <strong>{leave.employeeName}</strong> ·{" "}
        {leave.startDate} → {leave.endDate} (
        {leave.days} days) · {leave.department}
      </p>

      <input
        name="note"
        className="input flex-1"
        placeholder="HOD note"
      />

      <button
        name="decision"
        value="approve"
        className="btn-primary"
      >
        Approve → HR
      </button>

      <button
        name="decision"
        value="reject"
        className="rounded-xl border border-red-200 px-3 py-2 text-red-700"
      >
        Reject
      </button>
    </form>
  );
}

export function HrApprovalCard({ leave }) {
  return (
    <form
      action={hrApproveLeave}
      className="glass-card flex flex-wrap gap-2 p-4 text-sm"
    >
      <input
        type="hidden"
        name="id"
        value={leave.id}
      />

      <p className="w-full">
        <strong>{leave.employeeName}</strong> ·{" "}
        {leave.startDate} → {leave.endDate} (
        {leave.days}d) · HOD: {leave.hodApprovedBy}
      </p>

      <input
        name="note"
        className="input flex-1"
        placeholder="HR note"
      />

      <button
        name="decision"
        value="approve"
        className="btn-primary"
      >
        HR approve
      </button>

      <button
        name="decision"
        value="reject"
        className="rounded-xl border border-red-200 px-3 py-2 text-red-700"
      >
        Reject
      </button>
    </form>
  );
}