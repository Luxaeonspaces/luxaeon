import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createOutflow, decideDept, decideFinal, releaseFunds, editOutflow, cancelOutflow, recallOutflow, resubmitOutflow } from "./actions";
import { DEPARTMENTS } from "@/lib/rbac";
import OutflowDocs from "@/components/OutflowDocs";
import AmountInput from "@/components/AmountInput";

export default async function OutflowPage({
  searchParams,
}: {
  searchParams?: { created?: string; ok?: string; error?: string };
}) {
  const { user, perms } = await requireUser();
  const include = { documents: true as const };
  // HOD only sees makers from their department; Founder sees all
  const pendingDept = await prisma.outflowRequest.findMany({
    where: {
      status: "Pending Department",
      ...(perms.isFounder
        ? {}
        : perms.isHod && user.department
          ? { department: user.department }
          : { department: "__none__" }),
    },
    include,
    orderBy: { requestDate: "desc" },
  });
  const pendingFinal = await prisma.outflowRequest.findMany({
    where: { status: "Pending Founder" },
    include,
    orderBy: { requestDate: "desc" },
  });
  const pendingFinance = await prisma.outflowRequest.findMany({
    where: { status: "Pending Finance" },
    include,
    orderBy: { requestDate: "desc" },
  });
  // History: maker's HOD = own department only; Founder = all; others = own requests
  const all = await prisma.outflowRequest.findMany({
    where: perms.isFounder
      ? undefined
      : perms.isHod && user.department
        ? { department: user.department }
        : { OR: [{ requestedById: user.id }, { requestedBy: user.fullName }] },
    include,
    orderBy: { requestDate: "desc" },
    take: 40,
  });

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Outflow Approvals</h1>
        <p className="relative z-10 text-sm text-white/80">
          Expense workflow: Maker → Dept HOD (own dept) → Founder (approve) → Head of Finance (disburse only)
        </p>
      </div>

      {searchParams?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.ok && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{searchParams.ok}</p>}

      <form key={searchParams?.ok || searchParams?.created || "outflow-create"} action={createOutflow} className="glass-card grid gap-3 p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 font-semibold text-burgundy">New request (Maker)</h2>
        <p className="md:col-span-2 text-sm text-gray-500">Requested by: {user.fullName}</p>
        <select name="department" className="input" defaultValue={user.department || "General"}>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <input name="category" className="input" placeholder="Category" defaultValue="Materials" />
        <input name="description" className="input md:col-span-2" placeholder="Description *" required />
        <div>
          <AmountInput name="amount" placeholder="Amount (₦) *" required />
        </div>
        <input name="vendor" className="input" placeholder="Vendor" />
        <input name="projectCode" className="input" placeholder="Project code (optional)" />
        <input name="payeeName" className="input" placeholder="Payee name" />
        <input name="payeeBankName" className="input" placeholder="Bank name" />
        <input name="payeeAccountName" className="input" placeholder="Account name" />
        <input name="payeeAccountNo" className="input" placeholder="Account number" />
        <button type="submit" className="btn-primary md:col-span-2">
          Submit for department review
        </button>
        <p className="md:col-span-2 text-xs text-gray-500">
          After submit, upload supporting documents on the request card (or below if just created).
        </p>
      </form>

      {searchParams?.created && (
        <div className="glass-card p-4">
          <p className="mb-2 text-sm font-semibold text-burgundy">Upload supporting docs for this request</p>
          <OutflowDocs outflowId={searchParams.created} docs={[]} canUpload />
        </div>
      )}

      {perms.canDeptApprove && (
        <ApproveSection title="Department Head review" rows={pendingDept} action={decideDept} userName={user.fullName} />
      )}
      {perms.canFinalApprove && (
        <ApproveSection
          title="Founder approval → Finance"
          rows={pendingFinal}
          action={decideFinal}
          userName={user.fullName}
          approveLabel="Approve → Head of Finance"
        />
      )}
      {perms.canDisburseFunds && (
        <section className="glass-card p-5">
          <h2 className="mb-3 font-display font-semibold text-burgundy">Head of Finance — fund release</h2>
          {pendingFinance.map((r) => (
            <Card key={r.id} r={r} canUpload={false} canEdit={r.status === "Pending Department"}>
              <form action={releaseFunds} className="mt-2 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={r.id} />
                <input name="note" className="input flex-1" placeholder="Disbursement note" />
                <button name="decision" value="release" className="btn-primary">
                  Release funds
                </button>
                <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">
                  Reject
                </button>
              </form>
            </Card>
          ))}
          {pendingFinance.length === 0 && <p className="text-sm text-gray-500">None pending</p>}
        </section>
      )}

      <section className="glass-card p-5 space-y-3">
        <h2 className="font-semibold text-burgundy">History (with supporting docs)</h2>
        {all.map((r) => (
          <Card
            key={r.id}
            r={r}
            canUpload={r.requestedBy === user.fullName && r.status === "Pending Department"}
            canEdit={
              (r.status === "Pending Department" || r.status === "Recalled") &&
              (r.requestedBy === user.fullName ||
                r.requestedById === user.id ||
                perms.isFounder ||
                (perms.isHod && (!r.department || r.department === user.department)))
            }
          />
        ))}
      </section>
    </div>
  );
}

function Card({ r, canUpload, canEdit, children }: { r: any; canUpload?: boolean; canEdit?: boolean; children?: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-xl border border-gold/30 bg-white/50 p-3 text-sm">
      <p>
        <strong>{r.requestedBy}</strong> · ₦{r.amount.toLocaleString()} · {r.description}
      </p>
      <p className="text-xs text-gray-500">
        Status: {r.status} · Payee: {r.payeeName || "—"} · {r.payeeBankName} {r.payeeAccountNo}
      </p>
      <div className="mt-2 rounded-lg bg-cream/60 p-2 text-xs text-gray-600">
        <p className="font-semibold text-burgundy">Approval levels</p>
        <p>1. Dept HOD: {r.deptApprovedBy ? `${r.deptApprovedBy} (${r.deptDate?.slice(0, 10) || "—"})` : "Pending"} {r.deptNote ? `· ${r.deptNote}` : ""}</p>
        <p>2. Founder: {r.finalApprovedBy ? `${r.finalApprovedBy} (${r.finalDate?.slice(0, 10) || "—"})` : "Pending"} {r.finalNote ? `· ${r.finalNote}` : ""}</p>
        <p>3. Head of Finance: {r.financeReleasedBy ? `${r.financeReleasedBy} (${r.financeDate?.slice(0, 10) || "—"}) · ${r.linkedTxnId || ""}` : "Pending disbursement"}</p>
      </div>
      <OutflowDocs
        outflowId={r.id}
        docs={(r.documents || []).map((d: any) => ({
          id: d.id,
          name: d.originalName || d.filename,
          filename: d.filename,
          by: d.uploadedBy,
        }))}
        canUpload={canUpload}
      />
      {canEdit && (r.status === "Pending Department" || r.status === "Recalled") && (
        <form action={editOutflow} className="mt-3 grid gap-2 border-t border-gold/30 pt-3 md:grid-cols-2">
          <p className="md:col-span-2 text-xs font-semibold text-burgundy">Edit request (before HOD approval)</p>
          <input type="hidden" name="id" value={r.id} />
          <input name="description" className="input md:col-span-2" defaultValue={r.description} required />
          <input name="amount" className="input" defaultValue={r.amount} />
          <input name="category" className="input" defaultValue={r.category || ""} />
          <input name="vendor" className="input" defaultValue={r.vendor || ""} />
          <input name="projectCode" className="input" defaultValue={r.projectCode || ""} />
          <input name="payeeName" className="input" defaultValue={r.payeeName || ""} />
          <input name="payeeBankName" className="input" defaultValue={r.payeeBankName || ""} />
          <input name="payeeAccountName" className="input" defaultValue={r.payeeAccountName || ""} />
          <input name="payeeAccountNo" className="input" defaultValue={r.payeeAccountNo || ""} />
          <button type="submit" className="btn-primary md:col-span-2">Save changes</button>
        </form>
      )}
      {["Pending Department", "Pending Founder", "Pending Finance"].includes(r.status) && (
        <div className="mt-2 space-y-2 border-t border-gold/20 pt-2">
          <form action={recallOutflow} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="reason" className="input flex-1" placeholder="Reason for recall (optional)" />
            <button type="submit" className="rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              Recall (send to previous level)
            </button>
          </form>
          <form action={cancelOutflow} className="flex flex-wrap gap-2">
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
          <form action={resubmitOutflow}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="btn-primary text-xs">
              Resubmit to department HOD
            </button>
          </form>
          <form action={cancelOutflow}>
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">
              Cancel (void)
            </button>
          </form>
        </div>
      )}
      {children}
    </div>
  );
}

function ApproveSection({
  title,
  rows,
  action,
  userName,
  approveLabel = "Approve",
}: {
  title: string;
  rows: any[];
  action: (fd: FormData) => Promise<void>;
  userName: string;
  approveLabel?: string;
}) {
  return (
    <section className="glass-card p-5">
      <h2 className="mb-3 font-display font-semibold text-burgundy">{title}</h2>
      {rows.map((r) => (
        <Card key={r.id} r={r} canUpload={false} canEdit={r.status === "Pending Department"}>
          <form action={action} className="mt-2 flex flex-wrap gap-2">
            <input type="hidden" name="id" value={r.id} />
            <input name="note" className="input flex-1" placeholder="Note" />
            <button name="decision" value="approve" className="btn-primary">
              {approveLabel}
            </button>
            <button name="decision" value="reject" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">
              Reject
            </button>
          </form>
        </Card>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-500">None pending</p>}
    </section>
  );
}



// just to push
