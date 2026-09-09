"use client";

import { useFormStatus } from "react-dom";

export default function DecisionButtons({ approveLabel = "Approve", rejectLabel = "Reject", approveClassName = "btn-primary" }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        name="decision"
        value="approve"
        disabled={pending}
        className={`${approveClassName} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending ? "Submitting..." : approveLabel}
      </button>
      <button
        name="decision"
        value="reject"
        disabled={pending}
        className="rounded-xl border border-red-200 px-3 py-2 text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting..." : rejectLabel}
      </button>
    </>
  );
}