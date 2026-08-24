import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import TxnDocs from "@/components/TxnDocs";
import { logTxnAudit } from "@/lib/txnAudit";

export default async function TxnDetailPage({ params }: { params: { id: string } }) {
  const { user, perms } = await requireUser();
  if (!perms.canSeeFinance) redirect("/dashboard");

  const txn = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
  if (!txn) notFound();

  await logTxnAudit({
    transactionId: txn.id,
    txnId: txn.txnId,
    action: "Viewed",
    details: "Opened transaction detail",
    user,
  });

  const audits = await prisma.transactionAudit.findMany({
    where: { OR: [{ transactionId: txn.id }, { txnId: txn.txnId }] },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-2">
        <div className="main-header flex-1">
          <p className="relative z-10 text-xs text-gold/90">Transaction detail</p>
          <h1 className="relative z-10 font-display text-2xl font-semibold">{txn.txnId}</h1>
        </div>
        <Link href="/finance" className="rounded-xl border border-gold/40 bg-white/80 px-4 py-2 text-sm text-burgundy">
          ← Finance
        </Link>
      </div>

      <div className="glass-card grid gap-3 p-5 text-sm md:grid-cols-2">
        <p><strong>Type:</strong> {txn.type}</p>
        <p><strong>Amount:</strong> ₦{txn.amount.toLocaleString()}</p>
        <p><strong>Date:</strong> {txn.date}</p>
        <p><strong>Category:</strong> {txn.category || "—"}</p>
        <p className="md:col-span-2"><strong>Description:</strong> {txn.description || "—"}</p>
        <p><strong>Project:</strong> {txn.projectCode || "—"}</p>
        <p><strong>Client:</strong> {txn.clientName || "—"}</p>
        <p><strong>Sales person:</strong> {txn.salesPersonName || "—"}</p>
        <p><strong>Recorded by:</strong> {txn.createdBy || "—"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`/api/finance/export?id=${txn.id}&format=csv`} className="btn-primary">
          Download this transaction (CSV)
        </a>
        <a href={`/api/finance/export?id=${txn.id}&format=pdf`} className="rounded-xl border border-gold/50 bg-white/80 px-4 py-2 text-sm font-semibold text-burgundy">
          Download PDF
        </a>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">Transaction audit trail</div>
        <div className="table-scroll">
          <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => (
              <tr key={a.id} className="border-t border-gold/20">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{a.createdAt.toISOString().slice(0, 19)}</td>
                <td className="px-4 py-2">{a.performedBy} ({a.role})</td>
                <td className="px-4 py-2 font-medium text-burgundy">{a.action}</td>
                <td className="px-4 py-2 text-gray-600">{a.details}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <TxnDocs
        transactionId={txn.id}
        docs={txn.documents.map((d) => ({
          id: d.id,
          name: d.originalName || d.filename,
          filename: d.filename,
          category: d.category,
          by: d.uploadedBy,
        }))}
      />
    </div>
  );
}
