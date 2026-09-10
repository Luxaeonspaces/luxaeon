"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProcDocsUpload({ procurementId }: { procurementId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("kind", "procurement");
    fd.set("procurementId", procurementId);
    const toastId = toast.loading("Uploading document…");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success("Document uploaded", { id: toastId });
      setMsg("Document uploaded");
      form.reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
      setMsg(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={upload} className="mt-2 flex flex-wrap items-center gap-2">
      <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip" required className="text-xs" />
      <button type="submit" className="rounded-lg border border-gold/50 bg-gold/10 px-2 py-1 text-xs font-semibold text-burgundy" disabled={busy}>
        {busy ? "…" : "Upload support doc"}
      </button>
      {msg && <span className="text-xs text-burgundy">{msg}</span>}
    </form>
  );
}
