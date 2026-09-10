"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function FormSubmissionGuard() {
  useEffect(() => {
    const handleSubmit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.submitGuarded === "true") return;

      form.dataset.submitGuarded = "true";
      form.setAttribute("aria-busy", "true");

      const buttons = form.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
        'button[type="submit"], input[type="submit"], button[data-submit-trigger="true"]'
      );

      buttons.forEach((button) => {
        const originalText = button instanceof HTMLButtonElement ? button.textContent?.trim() : button.value;
        if (originalText) {
          button.dataset.originalText = originalText;
        }

        if (button instanceof HTMLButtonElement) {
          button.textContent = "Submitting…";
        } else {
          button.value = "Submitting…";
        }

        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
      });

      const toastId = toast.loading("Submitting…");
      form.dataset.toastId = String(toastId);
      (window as any).__luxaeonSubmitToastId = toastId;
    };

    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return null;
}
