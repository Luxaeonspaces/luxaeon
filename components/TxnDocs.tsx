"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TxnDocs({
  transactionId,
  docs,
}: {
  transactionId: string;
  docs: { id: string; name: string; filename: string; category: string | null; by: string | null }[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("kind", "finance");
    fd.set("transactionId", transactionId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("Document uploaded");
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
        <h2 className="mb-2 font-semibold text-burgundy">Supporting documents</h2>
        <ul className="space-y-2 text-sm">
          {docs.map((d) => (
            <li key={d.id} className="flex justify-between gap-2 border-b border-gold/20 pb-2">
              <span>
                {d.name}
                <span className="block text-xs text-gray-400">
                  {d.category} · {d.by}
                </span>
              </span>
              <a className="text-burgundy underline" href={`/api/files/finance/${d.filename}`}>
                Download
              </a>
            </li>
          ))}
          {docs.length === 0 && <li className="text-gray-500">No invoices / requisitions yet</li>}
        </ul>
      </div>
      <form onSubmit={upload} className="glass-card space-y-3 p-5">
        <h3 className="font-semibold text-burgundy">Upload invoice / requisition / receipt</h3>
        <select name="category" className="input">
          {["Invoice", "Requisition", "Receipt", "Payment proof", "Other"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip" required className="text-sm" />
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Uploading…" : "Upload"}
        </button>
        {msg && <p className="text-sm text-burgundy">{msg}</p>}
      </form>
    </div>
  );
}
