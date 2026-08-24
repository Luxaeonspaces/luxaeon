import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notFound } from "next/navigation";
import Link from "next/link";
import { addNote, updateProjectDetails, recordProjectPayment, editProjectPayment, completeProject } from "./actions";
import ProjectTools from "@/components/ProjectTools";
import { PROJECT_STAGES } from "@/lib/rbac";
import AmountInput from "@/components/AmountInput";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams?: { error?: string; ok?: string };
}) {
  const { user, perms } = await requireUser();
  const canEdit = perms.isFounder || perms.isHod || perms.isFinance;

  const project = await prisma.project.findUnique({
    where: { projectCode: params.code },
    include: {
      notesLog: { orderBy: { createdAt: "desc" } },
      files: { orderBy: { createdAt: "desc" } },
      clientDocs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) notFound();

  const paymentTxns = await prisma.transaction.findMany({
    where: { projectCode: project.projectCode, type: "Income" },
    include: { documents: true },
    orderBy: { createdAt: "desc" },
  });
  const paidFromHistory = paymentTxns.reduce((a, t) => a + t.amount, 0);

  const balance = Math.max(0, (project.designFee || 0) - (project.amountPaid || 0));
  const isLocked = project.status === "Completed" || project.stage === "Completed";
  const canEditActive = canEdit && !isLocked;
  const stageIdx = Math.max(0, PROJECT_STAGES.indexOf(project.stage as any));
  const progress = ((stageIdx + 1) / PROJECT_STAGES.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="main-header flex-1">
          <p className="relative z-10 text-xs uppercase tracking-wide text-gold/90">Project detail</p>
          <h1 className="relative z-10 font-display text-2xl font-semibold">{project.projectCode}</h1>
          <p className="relative z-10 text-sm text-white/85">
            {project.clientName}
            {project.projectName ? ` · ${project.projectName}` : ""}
            {project.salesPersonName ? ` · Sales: ${project.salesPersonName}` : ""}
          </p>
        </div>
        <Link href="/projects" className="rounded-xl border border-gold/40 bg-white/80 px-4 py-2 text-sm font-medium text-burgundy">
          ← All projects
        </Link>
      </div>

      {isLocked && (
        <div className="rounded-xl border-2 border-gold bg-gold/15 px-4 py-3 text-sm text-burgundy">
          <strong>Completed &amp; archived.</strong> This project is locked — details can be viewed and downloaded only.
          <a href="/archive" className="ml-2 font-semibold underline">Open Project Archives</a>
        </div>
      )}

      {!isLocked && (perms.isFounder || perms.isHod || perms.isFinance || perms.isDesign) && (
        <form
          action={completeProject.bind(null, project.projectCode)}
          className="rounded-2xl border-2 border-burgundy bg-burgundy/5 p-4"
        >
          <p className="mb-2 text-sm font-semibold text-burgundy">Project completion</p>
          <p className="mb-3 text-xs text-gray-600">
            When you mark this project completed, it becomes read-only and moves to <strong>Project Archives</strong>.
          </p>
          <button
            type="submit"
            className="w-full rounded-xl bg-burgundy px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 sm:w-auto"
          >
            Mark project completed
          </button>
        </form>
      )}


      {searchParams?.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>
      )}
      {searchParams?.ok && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{searchParams.ok}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Stage</div>
          <div className="font-display text-lg font-bold text-burgundy">{project.stage}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Design fee</div>
          <div className="font-display text-lg font-bold text-burgundy">₦{(project.designFee || 0).toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Paid</div>
          <div className="font-display text-lg font-bold text-burgundy">₦{(project.amountPaid || 0).toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Balance</div>
          <div className="font-display text-lg font-bold text-burgundy">₦{balance.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Pipeline progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-burgundy" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="glass-card grid gap-3 p-5 text-sm md:grid-cols-2">
        <h2 className="md:col-span-2 font-display text-lg font-semibold text-burgundy">All project details</h2>
        <Detail label="Client" value={project.clientName} />
        <Detail label="Sales owner" value={project.salesPersonName || "—"} />
        <Detail label="Location" value={project.location || "—"} />
        <Detail label="Status" value={project.status} />
        <Detail label="Created by" value={project.createdBy || "—"} />
        <Detail label="Access code" value={project.clientAccessCode || "—"} />
      </div>

      {canEditActive ? (
        <form action={updateProjectDetails.bind(null, project.projectCode)} className="glass-card grid gap-3 p-5 md:grid-cols-2">
          <h2 className="md:col-span-2 font-display font-semibold text-burgundy">Update project (Finance / HOD / Founder)</h2>
          <select name="stage" className="input" defaultValue={project.stage}>
            {PROJECT_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select name="status" className="input" defaultValue={project.status}>
            {["Active", "On Hold", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div>
            <span className="text-xs text-gray-500">Design fee</span>
            <AmountInput name="designFee" defaultValue={project.designFee} />
          </div>
          <div>
            <span className="text-xs text-gray-500">Amount paid</span>
            <AmountInput name="amountPaid" defaultValue={project.amountPaid} />
          </div>
          <input name="location" className="input" defaultValue={project.location || ""} placeholder="Location" />
          <input name="targetHandover" className="input" defaultValue={project.targetHandover || ""} placeholder="Target handover" />
          <textarea name="notes" className="input md:col-span-2" rows={2} defaultValue={project.notes || ""} placeholder="Notes" />
          <button type="submit" className="btn-primary md:col-span-2">
            Save changes
          </button>
        </form>
      ) : isLocked ? (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-burgundy">
          Project is completed and locked. View and download only — see Project Archives for exports.
        </p>
      ) : (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Unfortunately you cannot edit project details. Only Finance staff, Heads of Department, and Founder can edit.
        </p>
      )}

      {/* Payment history + balance */}
      <div className="glass-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/30 px-4 py-3">
          <h2 className="font-semibold text-burgundy">Payment history &amp; balance</h2>
          <div className="text-sm">
            Balance due:{" "}
            <strong className="text-burgundy">₦{balance.toLocaleString()}</strong>
          </div>
        </div>
        <div className="grid gap-3 border-b border-gold/20 p-4 sm:grid-cols-3 text-center text-sm">
          <div>
            <div className="text-xs uppercase text-gray-500">Design fee</div>
            <div className="font-semibold">₦{(project.designFee || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Total paid</div>
            <div className="font-semibold">₦{(project.amountPaid || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">From payment log</div>
            <div className="font-semibold">₦{paidFromHistory.toLocaleString()}</div>
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Txn ID</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Recorded by</th>
              <th className="px-4 py-2">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {paymentTxns.map((p) => (
              <tr key={p.id} className="border-t border-gold/20">
                <td className="px-4 py-2">{p.date}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.txnId}</td>
                <td className="px-4 py-2">{p.description}</td>
                <td className="px-4 py-2">₦{p.amount.toLocaleString()}</td>
                <td className="px-4 py-2">{p.createdBy || "—"}</td>
                <td className="px-4 py-2 text-xs">
                  {(p as any).documents?.length
                    ? (p as any).documents.map((d: any) => (
                        <a
                          key={d.id}
                          className="block text-burgundy underline"
                          href={`/api/files/finance/${d.filename}`}
                          target="_blank"
                        >
                          {d.originalName || "Receipt"}
                        </a>
                      ))
                    : "—"}
                </td>
              </tr>
            ))}
            {paymentTxns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  No payments recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="space-y-3 border-t border-gold/30 p-4">
          {canEditActive &&
            paymentTxns.map((p) => (
              <form
                key={`edit-${p.id}`}
                action={editProjectPayment.bind(null, project.projectCode)}
                className="grid gap-2 rounded-xl border border-gold/30 bg-white/50 p-3 md:grid-cols-5"
              >
                <input type="hidden" name="txnId" value={p.id} />
                <div className="text-xs text-gray-500 md:col-span-5">
                  Edit {p.txnId}
                  {(p as any).documents?.length
                    ? ` · ${(p as any).documents.length} receipt(s)`
                    : " · no receipt yet"}
                  {(p as any).documents?.map((d: any) => (
                    <a
                      key={d.id}
                      className="ml-2 text-burgundy underline"
                      href={`/api/files/finance/${d.filename}`}
                      target="_blank"
                    >
                      View receipt
                    </a>
                  ))}
                </div>
                <div>
                  <AmountInput name="amount" defaultValue={p.amount} />
                </div>
                <input
                  name="description"
                  className="input md:col-span-2"
                  defaultValue={p.description || ""}
                />
                <input name="receipt" type="file" accept="image/*,.pdf" className="text-xs" />
                <button type="submit" className="rounded-xl border border-gold/50 px-3 py-2 text-xs font-semibold text-burgundy">
                  Save correction
                </button>
              </form>
            ))}
        </div>
        {canEditActive && (
          <form
            action={recordProjectPayment.bind(null, project.projectCode)}
            key={searchParams?.ok || "pay-form"}
            className="grid gap-2 border-t border-gold/30 p-4 md:grid-cols-2"
            encType="multipart/form-data"
          >
            <p className="md:col-span-2 text-sm font-semibold text-burgundy">
              Record new payment (receipt required)
            </p>
            <div>
              <AmountInput name="amount" placeholder="Payment amount (₦) *" required />
            </div>
            <input name="note" className="input" placeholder="Note e.g. 50% deposit" />
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Payment receipt *</label>
              <input name="receipt" type="file" accept="image/*,.pdf" required className="text-sm" />
            </div>
            <button type="submit" className="btn-primary md:col-span-2">
              Record payment with receipt
            </button>
          </form>
        )}
      </div>

      {/* History & tracker downloads */}
      <div className="glass-card p-4">
        <h2 className="mb-2 font-semibold text-burgundy">Download project history</h2>
        <p className="mb-3 text-xs text-gray-500">Payments, notes and activity for this project</p>
        <div className="flex flex-wrap gap-2">
          <a
            className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-semibold text-burgundy"
            href={`/api/export/project-history?projectCode=${encodeURIComponent(project.projectCode)}&format=csv`}
          >
            History Excel
          </a>
          <a
            className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-semibold text-burgundy"
            href={`/api/export/project-history?projectCode=${encodeURIComponent(project.projectCode)}&format=pdf`}
          >
            History PDF
          </a>
          <a
            className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-semibold text-burgundy"
            href={`/api/export/project-history?projectCode=${encodeURIComponent(project.projectCode)}&format=word`}
          >
            History Word
          </a>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-burgundy">Documents & PDFs</h2>
        <ProjectTools projectCode={project.projectCode} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-2 font-semibold text-burgundy">Archive files ({project.files.length})</h3>
          <ul className="space-y-2 text-sm">
            {project.files.map((f) => (
              <li key={f.id} className="flex justify-between gap-2 border-b border-gold/20 pb-2">
                <span>{f.originalName || f.filename}</span>
                <a className="text-burgundy underline" href={`/api/files/uploads/${f.filename}`}>
                  Download
                </a>
              </li>
            ))}
            {project.files.length === 0 && <li className="text-gray-500">No files yet</li>}
          </ul>
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-2 font-semibold text-burgundy">Client portal docs ({project.clientDocs.length})</h3>
          <ul className="space-y-2 text-sm">
            {project.clientDocs.map((f) => (
              <li key={f.id} className="flex justify-between gap-2 border-b border-gold/20 pb-2">
                <span>{f.originalName || f.filename}</span>
                <a className="text-burgundy underline" href={`/api/files/client/${f.filename}`}>
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form key={searchParams?.ok || "note"} action={addNote.bind(null, project.id)} className="glass-card space-y-3 p-5">
        <h2 className="font-display font-semibold text-burgundy">Add internal note</h2>
        <textarea name="note" className="input" rows={3} required />
        <button type="submit" className="btn-primary">
          Save note
        </button>
      </form>

      <div className="glass-card p-5">
        <h2 className="mb-3 font-display font-semibold text-burgundy">Notes history</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {project.notesLog.map((n) => (
            <li key={n.id} className="border-b border-gold/20 pb-2">
              <span className="text-xs text-gray-400">{n.createdAt.toISOString().slice(0, 16)}</span>
              {n.createdBy ? ` · ${n.createdBy}` : ""} — {n.note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}
