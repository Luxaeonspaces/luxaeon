"use client";

import { useState } from "react";

import SubmitButton from "@/app/components/SubmitButton";
import { uploadFile } from "@/lib/clientUploads";
import { LEAVE_TYPES } from "./leave-types";
import { requestLeave } from "../actions";

export default function LeaveRequestForm({ message }) {
  const [leaveType, setLeaveType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const selectedType = LEAVE_TYPES[leaveType];

  const requiresDocument =
    selectedType?.requiresDocument || false;

  async function handleSubmit(event) {
    event.preventDefault();

    setUploadError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const file = formData.get("document");

    if (
      requiresDocument &&
      !(file instanceof File && file.size > 0)
    ) {
      setUploadError(
        "A supporting document is required for this leave type."
      );

      return;
    }

    try {
      setUploading(true);

      if (requiresDocument) {
        const result = await uploadFile({
          file,
          kind: "leave",
        });

        formData.set(
          "documentFilename",
          result.filename
        );

        formData.set(
          "documentName",
          result.originalName
        );
      }

      await requestLeave(formData);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Could not submit leave request."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      key={message || "leave-request"}
      className="glass-card grid gap-3 p-5 md:grid-cols-2"
    >
      <h2 className="md:col-span-2 font-semibold text-burgundy">
        Request leave
      </h2>

      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs text-gray-500">
          Leave type
        </span>

        <select
          name="leaveType"
          className="input"
          required
          value={leaveType}
          onChange={(event) => {
            setLeaveType(event.target.value);
            setUploadError("");
          }}
        >
          <option value="" disabled>
            Select leave type
          </option>

          {Object.entries(LEAVE_TYPES).map(
            ([key, type]) => (
              <option key={key} value={key}>
                {type.label} · {type.maxDays} days/year
              </option>
            )
          )}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-xs text-gray-500">
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
        <span className="mb-1 block text-xs text-gray-500">
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

      {requiresDocument && (
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-xs text-gray-500">
            Supporting document
          </span>

          <input
            name="document"
            type="file"
            className="input"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            required
          />

          <span className="mt-1 block text-xs text-gray-500">
            Upload a medical certificate or other
            supporting document. PDF, DOC, DOCX, JPG,
            PNG or WEBP.
          </span>
        </label>
      )}

      {uploadError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
          {uploadError}
        </p>
      )}

      <input
        type="hidden"
        name="documentFilename"
      />

      <input
        type="hidden"
        name="documentName"
      />

      <SubmitButton
        className="btn-primary md:col-span-2"
        pendingText={
          uploading
            ? "Uploading document..."
            : "Submitting request..."
        }
        disabled={uploading}
      >
        {uploading
          ? "Uploading document..."
          : "Submit to Head of Department"}
      </SubmitButton>
    </form>
  );
}