"use client";

import { useState } from "react";

type Doc = { id: string; name: string; filename: string; by?: string | null; href: string };

function kind(name: string) {
  const n = name.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(n)) return "image";
  if (/\.pdf$/.test(n)) return "pdf";
  if (/\.(docx?|docm|rtf)$/.test(n)) return "word";
  if (/\.(xlsx?|xlsm|csv)$/.test(n)) return "excel";
  if (/\.(pptx?|pptm)$/.test(n)) return "ppt";
  if (/\.(txt|md|json|log)$/.test(n)) return "text";
  return "other";
}

export default function DocList({ docs, title = "Supporting documents" }: { docs: Doc[]; title?: string }) {
  const [preview, setPreview] = useState<Doc | null>(null);
  const k = preview ? kind(preview.name || preview.filename) : "other";

  return (
    <div className="mt-2 space-y-2 text-sm">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <ul className="space-y-1">
        {docs.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gold/20 bg-white/60 px-2 py-1.5">
            <span className="min-w-0 break-words">
              <span className="mr-2 rounded bg-gold/15 px-1.5 py-0.5 text-[10px] uppercase text-burgundy">
                {kind(d.name || d.filename)}
              </span>
              {d.name}
              {d.by && <span className="text-xs text-gray-400"> · {d.by}</span>}
            </span>
            <span className="flex shrink-0 gap-2">
              <button type="button" className="text-xs font-semibold text-burgundy underline" onClick={() => setPreview(d)}>
                View
              </button>
              <a className="text-xs font-semibold text-gold underline" href={d.href} download target="_blank" rel="noreferrer">
                Download
              </a>
            </span>
          </li>
        ))}
        {docs.length === 0 && <li className="text-gray-400">No documents</li>}
      </ul>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={() => setPreview(null)}>
          <div
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gold/40 bg-[#faf8f3] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gold/30 bg-white/80 px-4 py-3">
              <div>
                <p className="font-semibold text-burgundy">{preview.name}</p>
                <p className="text-xs text-gray-500">View first · download only if you need a copy</p>
              </div>
              <div className="flex gap-2">
                <a href={preview.href} download className="rounded-lg border border-gold/50 px-3 py-1.5 text-xs font-semibold text-burgundy">
                  Download
                </a>
                <button type="button" className="rounded-lg bg-burgundy px-3 py-1.5 text-xs text-white" onClick={() => setPreview(null)}>
                  Close
                </button>
              </div>
            </div>
            <div className="min-h-[50vh] flex-1 overflow-auto bg-white p-2">
              {k === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.href} alt={preview.name} className="mx-auto max-h-[75vh] object-contain" />
              )}
              {k === "pdf" && <iframe src={preview.href} className="h-[75vh] w-full rounded-lg border" title={preview.name} />}
              {(k === "word" || k === "excel" || k === "ppt") && (
                <div className="space-y-3 p-6 text-sm text-gray-700">
                  <p className="font-medium text-burgundy">Office document preview</p>
                  <p>
                    Browsers cannot fully render Word/Excel/PowerPoint inside the app without an online viewer. You can:
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      <a className="text-burgundy underline" href={preview.href} target="_blank" rel="noreferrer">
                        Open file in a new tab
                      </a>{" "}
                      (browser or OS will handle it)
                    </li>
                    <li>Download, then open in Word / Excel / WPS</li>
                  </ul>
                  <iframe src={preview.href} className="mt-4 h-48 w-full rounded-lg border bg-cream/50" title="attempt" />
                  <p className="text-xs text-gray-500">If the frame is blank, use Open in new tab or Download — file is stored correctly.</p>
                </div>
              )}
              {k === "text" && <iframe src={preview.href} className="h-[75vh] w-full rounded-lg border bg-white" title={preview.name} />}
              {k === "other" && (
                <div className="p-6 text-sm">
                  <p>Preview not available for this type. Use download or open in a new tab.</p>
                  <a className="text-burgundy underline" href={preview.href} target="_blank" rel="noreferrer">
                    Open file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
