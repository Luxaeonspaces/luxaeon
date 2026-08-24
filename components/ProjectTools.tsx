"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DocType =
  | "invoice"
  | "proposal"
  | "summary"
  | "status"
  | "changeorder"
  | "handover"
  | "agreement";

const DOCS: { type: DocType; label: string }[] = [
  { type: "proposal", label: "Proposal" },
  { type: "invoice", label: "Invoice" },
  { type: "agreement", label: "Agreement" },
  { type: "status", label: "Status update" },
  { type: "changeorder", label: "Change order" },
  { type: "handover", label: "Handover" },
  { type: "summary", label: "Full project pack" },
];

export default function ProjectTools({ projectCode }: { projectCode: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function downloadPdf(type: DocType) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type === "summary" ? "summary" : type, projectCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "PDF failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Luxaeon_${type}_${projectCode}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`Downloaded PDF with live project data (${type})`);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadDocx(type: DocType) {
    if (type === "summary") {
      setMsg("Full pack is PDF-only — use PDF button, or download Invoice/Proposal Word below.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, projectCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Word fill failed — run npm install pizzip docxtemplater");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Luxaeon_${type}_${projectCode}_FILLED.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`Downloaded Word file filled with live data for ${projectCode}`);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("projectCode", projectCode);
    fd.set("kind", "project");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("File uploaded to project archive");
      form.reset();
      router.refresh();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function shareWithClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("projectCode", projectCode);
    fd.set("kind", "client");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("Shared to client portal");
      form.reset();
      router.refresh();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card space-y-3 p-4">
        <h3 className="font-semibold text-burgundy">Live-filled documents (downloadable)</h3>
        <p className="text-xs text-gray-500">
          Uses this project&apos;s client, fees, stage, location and notes from the database + Docs &amp; Templates layout.
        </p>

        <p className="text-xs font-semibold text-gray-500">PDF (always works)</p>
        <div className="flex flex-wrap gap-2">
          {DOCS.map((b) => (
            <button
              key={`pdf-${b.type}`}
              type="button"
              className="btn-primary !px-3 !py-2 !text-xs"
              disabled={busy}
              onClick={() => downloadPdf(b.type)}
            >
              {b.label} PDF
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-500">Word — template filled with live data</p>
        <div className="flex flex-wrap gap-2">
          {DOCS.filter((b) => b.type !== "summary").map((b) => (
            <button
              key={`docx-${b.type}`}
              type="button"
              className="rounded-xl border border-gold/50 bg-white/80 px-3 py-2 text-xs font-semibold text-burgundy"
              disabled={busy}
              onClick={() => downloadDocx(b.type)}
            >
              {b.label} Word
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gold/30 pt-3">
          <a
            href={`/api/export/project?projectCode=${encodeURIComponent(projectCode)}`}
            className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-semibold text-burgundy"
          >
            Project data Excel
          </a>
          <a
            href={`/api/export/procurement?projectCode=${encodeURIComponent(projectCode)}`}
            className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-semibold text-burgundy"
          >
            Procurement Excel
          </a>
        </div>
      </div>

      <form onSubmit={upload} className="glass-card space-y-3 p-4">
        <h3 className="font-semibold text-burgundy">Upload to project archive</h3>
        <select name="category" className="input">
          {["General", "Contract", "Design", "Invoice", "Site Photos", "Other"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input name="description" className="input" placeholder="Description" />
        <input name="file" type="file" required className="text-sm" />
        <button type="submit" className="btn-primary" disabled={busy}>
          Upload
        </button>
      </form>

      <form onSubmit={shareWithClient} className="glass-card space-y-3 p-4">
        <h3 className="font-semibold text-burgundy">Share file with client (portal)</h3>
        <input name="description" className="input" placeholder="Description" />
        <input name="file" type="file" required className="text-sm" />
        <button type="submit" className="btn-primary" disabled={busy}>
          Share to client portal
        </button>
      </form>

      {msg && <p className="text-sm text-burgundy">{msg}</p>}
    </div>
  );
}
