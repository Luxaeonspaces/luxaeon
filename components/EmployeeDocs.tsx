"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Doc = {
  id: string;
  name: string;
  filename: string;
  category: string | null;
  by: string | null;
  createdAt: string;
};

export default function EmployeeDocs({ userId, docs }: { userId: string; docs: Doc[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("userId", userId);
    fd.set("kind", "employee");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("Document uploaded to employee archive");
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
      <div className="glass-card p-5">
        <h2 className="mb-3 font-display font-semibold text-burgundy">Employee document archive</h2>
        <ul className="space-y-2 text-sm">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 border-b border-gold/20 pb-2">
              <span>
                {d.name}
                <span className="block text-xs text-gray-400">
                  {d.category} · {d.by} · {d.createdAt}
                </span>
              </span>
              <a className="text-burgundy underline" href={`/api/files/hr/${d.filename}`}>
                Download
              </a>
            </li>
          ))}
          {docs.length === 0 && <li className="text-gray-500">No documents yet</li>}
        </ul>
      </div>

      <form onSubmit={upload} className="glass-card space-y-3 p-5">
        <h3 className="font-semibold text-burgundy">Upload HR document</h3>
        <select name="category" className="input">
          {["General", "CV", "Certificate", "ID", "Guarantor", "Medical", "Contract", "Other"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input name="description" className="input" placeholder="Description" />
        <input name="file" type="file" required className="text-sm" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip" />
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Uploading…" : "Upload document"}
        </button>
        {msg && <p className="text-sm text-burgundy">{msg}</p>}
      </form>
    </div>
  );
}
