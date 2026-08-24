import { readdir } from "fs/promises";
import path from "path";
import { requireUser } from "@/lib/session";

const GROUPS: { title: string; match: (f: string) => boolean }[] = [
  {
    title: "Client-facing templates",
    match: (f) =>
      /^(01_|02_|03_|04_|05_|06_|07_|08_|09_|10_|11_|12_|13_)/.test(f),
  },
  {
    title: "Operations & vendors",
    match: (f) => /^(14_|15_|16_|17_|18_|20_|21_)/.test(f),
  },
];

export default async function DocumentsPage() {
  await requireUser();
  const dir = path.join(process.cwd(), "public", "templates");
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".docx") || f.endsWith(".xlsx"));
  } catch {
    files = [];
  }

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Documents & Templates</h1>
        <p className="relative z-10 text-sm text-white/85">
          Download branded blanks · Project PDFs/Word auto-fill these layouts with live data
        </p>
      </div>

      <div className="glass-card space-y-2 p-5 text-sm text-gray-700">
        <p className="font-semibold text-burgundy">Where to download generated files</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Project → Documents & PDFs</strong> — Invoice, Proposal, Status, Handover (PDF + Word) and Project/Procurement Excel
          </li>
          <li>
            <strong>Payroll</strong> — Download all payroll (Excel) or per batch
          </li>
          <li>
            <strong>Procurement</strong> — Download all procurement (Excel)
          </li>
          <li>
            <strong>Finance</strong> — Income / Expense CSV & PDF
          </li>
          <li>
            <strong>This page</strong> — Original Word/Excel template files (blank)
          </li>
        </ul>
      </div>

      {GROUPS.map((g) => {
        const list = files.filter(g.match);
        if (!list.length) return null;
        return (
          <div key={g.title} className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-burgundy">{g.title}</h2>
            <div className="glass-card grid gap-3 p-5 sm:grid-cols-2">
              {list.map((f) => (
                <a
                  key={f}
                  href={`/templates/${encodeURIComponent(f)}`}
                  download={f}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gold/40 bg-white/70 px-4 py-3 text-sm font-medium text-burgundy transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span>⬇️ {f.replace(/_/g, " ").replace(/\.\w+$/, "")}</span>
                  <span className="text-xs text-gray-400">{f.endsWith(".xlsx") ? "Excel" : "Word"}</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {files.filter((f) => !GROUPS.some((g) => g.match(f))).length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-burgundy">Other templates</h2>
          <div className="glass-card grid gap-3 p-5 sm:grid-cols-2">
            {files
              .filter((f) => !GROUPS.some((g) => g.match(f)))
              .map((f) => (
                <a
                  key={f}
                  href={`/templates/${encodeURIComponent(f)}`}
                  download={f}
                  className="rounded-xl border border-gold/40 bg-white/70 px-4 py-3 text-sm font-medium text-burgundy"
                >
                  ⬇️ {f}
                </a>
              ))}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <p className="text-sm text-gray-500">No templates found. Ensure public/templates is present.</p>
      )}
    </div>
  );
}
