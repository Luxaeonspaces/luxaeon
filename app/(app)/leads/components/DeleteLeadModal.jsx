"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { deleteLead } from "../actions";

export default function DeleteLeadModal({ lead }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setError("");
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isPending]);

  function handleDelete() {
    setError("");

    const formData = new FormData();
    formData.set("leadId", lead.id);

    startTransition(async () => {
      try {
        const result = await deleteLead(formData);

        if (!result.success) {
          setError(result.error || "Unable to delete lead.");
          return;
        }

        setIsOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Delete lead error:", error);
        setError("Something went wrong while deleting this lead.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
      >
        Delete
      </button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/50 p-4"
            onClick={() => {
              if (!isPending) setIsOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`delete-lead-${lead.id}`}
              className="glass-card w-full max-w-md p-5 sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id={`delete-lead-${lead.id}`}
                    className="font-display text-xl font-semibold text-burgundy"
                  >
                    Delete lead
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Permanently delete <strong>{lead.fullName}</strong>? This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close delete confirmation"
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-cream disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {error && (
                <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDelete}
                  className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Deleting lead..." : "Delete lead"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
