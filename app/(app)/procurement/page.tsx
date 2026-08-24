import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  requestProcurement,
  hodApproveProcurement,
  founderApproveProcurement,
  financeDisburseProcurement,
  editProcurement,
  cancelProcurement,
  recallProcurement,
  resubmitProcurement,
} from "./actions";
import AmountInput from "@/components/AmountInput";
import DocList from "@/components/DocList";
import ProcDocsUpload from "@/components/ProcDocsUpload";

export default async function ProcurementPage({
  searchParams,
}: {
  searchParams?: { created?: string; ok?: string };
}) {
  const { user, perms } = await requireUser();
  const rows = await prisma.procurementRequest.findMany({
    include: { documents: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const projects = await prisma.project.findMany({
    where: { status: "Active" },
    select: { projectCode: true, clientName: true },
    orderBy: { updatedAt: "desc" },
  });

  const canRequest = perms.isFounder || perms.isDesign || perms.isProcurement || perms.isHod;
  const isProcHod = perms.isFounder || (perms.isHod && perms.isProcurement);

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Procurement</h1>
        <p className="relative z-10 text-sm text-white/85">
          Design may request · Procurement HOD → Founder → Head of Finance (same matrix as outflow)
        </p>
      </div>

      {searchParams?.ok && (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-burgundy">{searchParams.ok}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <a
          href="/api/export/procurement?all=1"
          className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-burgundy"
        >
          Download all procurement (Excel)
        </a>
      </div>

      {canRequest && (
        <form key={searchParams?.ok || "proc-create"} action={requestProcurement} className="glass-card grid gap-3 p-5 md:grid-cols-2">
          <h2 className="md:col-span-2 font-semibold text-burgundy">New procurement request</h2>
          <input name="title" className="input" placeholder="What do you need? *" required />
          <select name="category" className="input">
            {["Materials", "Furniture", "Lighting", "Services", "Logistics", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select name="projectCode" className="input">
            <option value="">No project link</option>
            {projects.map((p) => (
              <option key={p.projectCode} value={p.projectCode}>
                {p.projectCode} — {p.clientName}
              </option>
            ))}
          </select>
          <div>
            <AmountInput name="estimatedCost" placeholder="Estimated cost (₦)" />
          </div>
          <input name="vendorPreferred" className="input" placeholder="Preferred vendor" />
          <input name="payeeName" className="input" placeholder="Payee name" />
          <input name="payeeBankName" className="input" placeholder="Bank name" />
          <input name="payeeAccountName" className="input" placeholder="Account name" />
          <input name="payeeAccountNo" className="input" placeholder="Account number" />
          <textarea name="description" className="input md:col-span-2" rows={2} placeholder="Specs / details" />
          <button type="submit" className="btn-primary md:col-span-2">
            Submit request
          </button>
        </form>
      )}

      {searchParams?.created && (
        <div className="glass-card p-4">
          <p className="mb-2 text-sm font-semibold text-burgundy">Upload supporting documents</p>
          <ProcDocsUpload procurementId={searchParams.created} />
        </div>
      )}

      {isProcHod && (
        <Queue
          title="Head of Procurement review"
          rows={rows.filter((r) => r.status === "Pending Procurement HOD")}
          action={hodApproveProcurement}
          canUpload
        />
      )}
      {perms.isFounder && (
        <Queue title="Founder approval" rows={rows.filter((r) => r.status === "Pending Founder")} action={founderApproveProcurement} />
      )}
      {perms.isHeadOfFinance && (
        <Queue
          title="Head of Finance — disbursement"
          rows={rows.filter((r) => r.status === "Pending Finance")}
          action={financeDisburseProcurement}
          finance
        />
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-burgundy">All requests</h2>
        {rows.map((r) => (
          <ProcCard
            key={r.id}
            r={r}
            canUpload={perms.isProcurement || r.requestedBy === user.fullName}
            canEdit={
              (r.status === "Pending Procurement HOD" || r.status === "Recalled") &&
              (r.requestedBy === user.fullName ||
                perms.isFounder ||
                (perms.isHod && perms.isProcurement))
            }
          />
        ))}
      </section>
    </div>
  );
}

function Queue({
  title,
  rows,
  action,
  finance,
  canUpload,
}: {
  title: string;
  rows: any[];
  action: (fd: FormData) => Promise<void>;
  finance?: boolean;
  canUpload?: boolean;
}) {
  return (
    <section className="glass-card space-y-3 p-5">
      <h2 className="font-display font-semibold text-burgundy">{title}</h2>
      {rows.map((r) => (
        <div key={r.id}>
          <ProcCard r={r} canUpload={canUpload} canEdit={r.status === "Pending Procurement HOD"} />
          <form action={action} className="mt-2 flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="note" className="input flex-1" placeholder="Note" />
            <button name="decision" value={finance ? "release" : "approve"} className="btn-primary">
              {finance ? "Disburse funds" : "Approve"}
            </button>
            <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">
              Reject
            </button>
          </form>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-500">None pending</p>}
    </section>
  );
}

function ProcCard({ r, canUpload, canEdit }: { r: any; canUpload?: boolean; canEdit?: boolean }) {
  return (
    <div className="rounded-xl border border-gold/40 bg-white/60 p-3 text-sm">
      <p className="font-semibold text-burgundy">{r.title}</p>
      <p className="text-xs text-gray-500">
        {r.requestedBy} · {r.department} · {r.projectCode || "No project"} · ₦{(r.estimatedCost || 0).toLocaleString()} ·{" "}
        <strong>{r.status}</strong>
      </p>
      {r.description && <p className="mt-1 text-gray-600">{r.description}</p>}
      <div className="mt-2 rounded-lg bg-gold/10 p-2 text-xs">
        <p className="font-semibold text-burgundy">Approval levels</p>
        <p>1. Procurement HOD: {r.hodApprovedBy || "Pending"} {r.hodNote ? `· ${r.hodNote}` : ""}</p>
        <p>2. Founder: {r.founderApprovedBy || "Pending"} {r.founderNote ? `· ${r.founderNote}` : ""}</p>
        <p>3. Head of Finance: {r.financeReleasedBy || "Pending"} {r.linkedTxnId ? `· ${r.linkedTxnId}` : ""}</p>
      </div>
      <DocList
        docs={(r.documents || []).map((d: any) => ({
          id: d.id,
          name: d.originalName || d.filename,
          filename: d.filename,
          by: d.uploadedBy,
          href: `/api/files/procurement/${d.filename}`,
        }))}
      />
      {canUpload && <ProcDocsUpload procurementId={r.id} />}
      {["Pending Procurement HOD", "Pending Founder", "Pending Finance"].includes(r.status) && (
        <div className="mt-2 space-y-2 border-t border-gold/20 pt-2">
          <form action={recallProcurement} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="reason" className="input flex-1" placeholder="Reason for recall (optional)" />
            <button type="submit" className="rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              Recall (send to previous level)
            </button>
          </form>
          <form action={cancelProcurement} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="reason" className="input flex-1" placeholder="Reason to void voucher (optional)" />
            <button type="submit" className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">
              Cancel (void requisition)
            </button>
          </form>
        </div>
      )}
      {r.status === "Recalled" && (
        <div className="mt-2 flex flex-wrap gap-2 border-t border-gold/20 pt-2">
          <form action={resubmitProcurement}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="btn-primary text-xs">Resubmit to Procurement HOD</button>
          </form>
          <form action={cancelProcurement}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">
              Cancel (void)
            </button>
          </form>
        </div>
      )}
      {canEdit && (r.status === "Pending Procurement HOD" || r.status === "Recalled") && (
        <form action={editProcurement} className="mt-3 grid gap-2 border-t border-gold/30 pt-3 md:grid-cols-2">
          <p className="md:col-span-2 text-xs font-semibold text-burgundy">Edit before Procurement HOD approval</p>
          <input type="hidden" name="id" value={r.id} />
          <input name="title" className="input md:col-span-2" defaultValue={r.title} required />
          <input name="estimatedCost" className="input" defaultValue={r.estimatedCost} />
          <input name="category" className="input" defaultValue={r.category || ""} />
          <input name="projectCode" className="input" defaultValue={r.projectCode || ""} />
          <input name="vendorPreferred" className="input" defaultValue={r.vendorPreferred || ""} />
          <input name="payeeName" className="input" defaultValue={r.payeeName || ""} />
          <input name="payeeBankName" className="input" defaultValue={r.payeeBankName || ""} />
          <input name="payeeAccountNo" className="input" defaultValue={r.payeeAccountNo || ""} />
          <textarea name="description" className="input md:col-span-2" defaultValue={r.description || ""} rows={2} />
          <button type="submit" className="btn-primary md:col-span-2">Save changes</button>
        </form>
      )}
    </div>
  );
}
