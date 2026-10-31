
"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { updateLead } from "../actions";

const sources = [
  "Instagram",
  "TikTok",
  "Referral",
  "WhatsApp",
  "Website",
  "Other",
];

const statuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
  "Nurture",
];

export default function EditLeadModal({ lead, salesPeople }) {
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

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await updateLead(formData);

        if (!result.success) {
          setError(result.error || "Unable to update lead.");
          return;
        }

        setIsOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Update lead error:", error);
        setError("Something went wrong while updating this lead.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-medium text-burgundy transition hover:bg-cream"
      >
        Edit
      </button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center overflow-y-auto bg-black/50 p-4"
            onClick={() => {
              if (!isPending) setIsOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`edit-lead-${lead.id}`}
              className="glass-card relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto overscroll-contain p-5 sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2
                    id={`edit-lead-${lead.id}`}
                    className="font-display text-xl font-semibold text-burgundy"
                  >
                    Edit lead
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update this lead's information.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close edit form"
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-cream disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                <input
                  type="hidden"
                  name="leadId"
                  value={lead.id}
                />

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Full name *
                  </label>
                  <input
                    name="fullName"
                    className="input w-full"
                    defaultValue={lead.fullName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="input w-full"
                    defaultValue={lead.email || ""}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    className="input w-full"
                    defaultValue={lead.phone || ""}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Location
                  </label>
                  <input
                    name="location"
                    className="input w-full"
                    defaultValue={lead.location || ""}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Source
                  </label>
                  <select
                    name="source"
                    className="input w-full"
                    defaultValue={lead.source || ""}
                  >
                    <option value="">Select source</option>
                    {sources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    name="status"
                    className="input w-full"
                    defaultValue={lead.status}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Sales owner
                  </label>
                  <select
                    name="ownerUserId"
                    className="input w-full"
                    defaultValue={lead.ownerUserId || ""}
                  >
                    <option value="">No sales owner</option>

                    {lead.ownerUserId &&
                      !salesPeople.some(
                        (person) => person.id === lead.ownerUserId
                      ) && (
                        <option value={lead.ownerUserId}>
                          {lead.ownerName || "Previous owner"} (inactive)
                        </option>
                      )}

                    {salesPeople.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Message / notes
                  </label>
                  <textarea
                    name="notes"
                    className="input w-full"
                    defaultValue={lead.notes || ""}
                    rows={4}
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600 md:col-span-2"
                  >
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 md:col-span-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Updating lead..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
