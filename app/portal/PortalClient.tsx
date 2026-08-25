"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STAGES = [
  "Lead",
  "Proposal Sent",
  "Onboarding",
  "Concept Design",
  "Detailed Design",
  "Procurement",
  "Installation",
  "Handover",
  "Completed",
];

type Doc = {
  id: string;
  name: string;
  filename: string;
  by: string | null;
  role: string | null;
  description: string | null;
};

type Project = {
  projectCode: string;
  clientName: string;
  projectName: string | null;
  stage: string;
  location: string | null;
  targetHandover: string | null;
};

export default function PortalClient({
  initialCode,
  initialAccess,
  project,
  invalid,
  docs,
}: {
  initialCode: string;
  initialAccess: string;
  project: Project | null;
  invalid: boolean;
  docs: Doc[];
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [access, setAccess] = useState(initialAccess);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  function view(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/portal?code=${encodeURIComponent(code)}&access=${encodeURIComponent(access)}`);
  }

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!project) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("projectCode", project.projectCode);
    fd.set("accessCode", access);
    fd.set("kind", "client");
    fd.set("uploadedByRole", "client");
    fd.set("uploadedBy", project.clientName);
    setUploading(true);
    setMsg("");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("File uploaded — your project team can see it.");
      form.reset();
      router.refresh();
    } catch (err: any) {
      setMsg(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const progress = project ? (STAGES.indexOf(project.stage) + 1) / STAGES.length : 0;

  return (
    <div className="space-y-5">
      <form onSubmit={view} className="glass-card grid gap-3 p-5 sm:grid-cols-3">
        <input
          className="input"
          placeholder="Project code e.g. LX-2026-001"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Access code"
          value={access}
          onChange={(e) => setAccess(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">
          View my project
        </button>
      </form>

      {invalid && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Invalid Project Code or Access Code — check the details from Luxaeon Spaces.
        </p>
      )}

      {project && (
        <>
          <div className="glass-card space-y-3 p-5">
            <p className="text-lg font-semibold text-burgundy">Welcome, {project.clientName}</p>
            <p className="text-sm">
              <strong>Project:</strong> {project.projectName || project.projectCode}
            </p>
            <p className="text-sm">
              <strong>Stage:</strong> {project.stage}
            </p>
            <p className="text-sm">
              <strong>Target handover:</strong> {project.targetHandover || "To be confirmed"}
            </p>
            <p className="text-sm">
              <strong>Location:</strong> {project.location || "—"}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-burgundy transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="text-xs text-gray-500">Progress through design stages</p>
          </div>

          <div className="glass-card p-5">
            <h2 className="mb-3 font-display font-semibold text-burgundy">Documents for you</h2>
            {docs.length === 0 && <p className="text-sm text-gray-500">No documents shared yet.</p>}
            <ul className="space-y-2">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {d.name}
                    {d.description ? ` — ${d.description}` : ""}
                    <span className="block text-xs text-gray-400">
                      by {d.by} ({d.role})
                    </span>
                  </span>
                  <a
                    className="shrink-0 rounded-lg border border-gold/50 px-3 py-1 text-xs font-semibold text-burgundy hover:bg-cream"
                    href={`/api/files/client/${d.filename}`}
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={upload} className="glass-card space-y-3 p-5">
            <h2 className="font-display font-semibold text-burgundy">Upload your files</h2>
            <p className="text-xs text-gray-500">
              Floor plans, inspiration images, payment receipts — your design team will see these.
            </p>
            <input name="description" className="input" placeholder="Description (optional)" />
            <input
              name="file"
              type="file"
              required
              className="block w-full text-sm"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mov,.webm,.avi"
            />
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload file"}
            </button>
            {msg && <p className="text-sm text-burgundy">{msg}</p>}
          </form>
        </>
      )}
    </div>
  );
}
