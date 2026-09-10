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

      if (!document.getElementById("luxaeon-global-processing-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "luxaeon-global-processing-overlay";
        overlay.setAttribute("role", "status");
        overlay.setAttribute("aria-live", "polite");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "9999";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.background = "rgba(31, 23, 22, 0.45)";
        overlay.style.backdropFilter = "blur(2px)";

        const panel = document.createElement("div");
        panel.style.display = "flex";
        panel.style.flexDirection = "column";
        panel.style.alignItems = "center";
        panel.style.gap = "0.75rem";
        panel.style.padding = "1.25rem 1.5rem";
        panel.style.borderRadius = "16px";
        panel.style.background = "rgba(255, 255, 255, 0.96)";
        panel.style.boxShadow = "0 18px 50px rgba(35, 15, 12, 0.2)";
        panel.style.minWidth = "220px";
        panel.style.color = "#4b2d2a";

        const spinner = document.createElement("div");
        spinner.style.width = "28px";
        spinner.style.height = "28px";
        spinner.style.border = "3px solid rgba(75, 45, 42, 0.18)";
        spinner.style.borderTopColor = "#4b2d2a";
        spinner.style.borderRadius = "50%";
        spinner.style.animation = "spin 0.8s linear infinite";

        const label = document.createElement("div");
        label.textContent = "Processing…";
        label.style.fontSize = "0.95rem";
        label.style.fontWeight = "600";
        label.style.letterSpacing = "0.01em";

        const styleTag = document.createElement("style");
        styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(styleTag);

        panel.appendChild(spinner);
        panel.appendChild(label);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
      }

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
