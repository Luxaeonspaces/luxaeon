"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
  className = "btn-primary",
  disabled = false,
  pending = undefined,
  ...props
}) {
  const { pending: formPending } = useFormStatus();
  const isPending = Boolean(pending ?? formPending ?? disabled);

  return (
    <button
      type="submit"
      disabled={isPending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      {...props}
    >
      {isPending ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {pendingText || "Submitting..."}
        </span>
      ) : (
        children
      )}
    </button>
  );
}