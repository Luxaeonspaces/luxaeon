"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DocList from "./DocList";

export default function OutflowDocs({
  outflowId,
  docs,
  canUpload,
}: {
  outflowId: string;
  docs: { id: string; name: string; filename: string; by: string | null }[];
  canUpload?: boolean;
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
    fd.set("kind", "outflow");
    fd.set("outflowId", outflowId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("Supporting document uploaded");
      form.reset();
      router.refresh();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 space-y-2 text-sm">
      <DocList
        docs={docs.map((d) => ({
          id: d.id,
          name: d.name,
          filename: d.filename,
          by: d.by,
          href: `/api/files/outflow/${d.filename}`,
        }))}
      />
      {canUpload && (
        <form onSubmit={upload} className="flex flex-wrap items-center gap-2">
          <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip" required className="text-xs" />
          <button type="submit" className="rounded-lg border border-gold/50 bg-gold/10 px-2 py-1 text-xs font-semibold text-burgundy" disabled={busy}>
            {busy ? "…" : "Upload support doc"}
          </button>
          {msg && <span className="text-xs text-burgundy">{msg}</span>}
        </form>
      )}
    </div>
  );
}
