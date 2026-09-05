import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

import TransactionHeader from "./components/TransactionHeader";
import TransactionDetails from "./components/TransactionDetails";
import TransactionDownloads from "./components/TransactionDownloads";
import TransactionAudit from "./components/TransactionAudit";
import TransactionAuditSkeleton from "./components/TransactionAuditSkeleton";
import { getTransaction } from "./components/transaction-data";

import TxnDocs from "@/components/TxnDocs";
import { logTxnAudit } from "@/lib/txnAudit";

export default async function TxnDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, perms } = await requireUser();

  if (!perms.canSeeFinance) {
    redirect("/dashboard");
  }

  const txn = await getTransaction(params.id);

  if (!txn) {
    notFound();
  }

  await logTxnAudit({
    transactionId: txn.id,
    txnId: txn.txnId,
    action: "Viewed",
    details: "Opened transaction detail",
    user,
  });

  return (
    <div className="space-y-6">
      <TransactionHeader txnId={txn.txnId} />

      <TransactionDetails transaction={txn} />

      <TransactionDownloads transactionId={txn.id} />

      <Suspense fallback={<TransactionAuditSkeleton />}>
        <TransactionAudit
          transactionId={txn.id}
          txnId={txn.txnId}
        />
      </Suspense>

      <TxnDocs
        transactionId={txn.id}
        docs={txn.documents.map((document) => ({
          id: document.id,
          name: document.originalName || document.filename,
          filename: document.filename,
          category: document.category,
          by: document.uploadedBy,
        }))}
      />
    </div>
  );
}