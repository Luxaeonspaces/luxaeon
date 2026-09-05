import { prisma } from "./prisma";
import { logTxnAudit } from "./txnAudit";

export async function nextTxnId() {
  const year = new Date().getFullYear();
  const count = await prisma.transaction.count();
  return `LX-TXN-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function createTransaction(data, user) {
  const txnId = await nextTxnId();
  const row = await prisma.transaction.create({
    data: {
      txnId,
      type: data.type,
      category: data.category || null,
      description: data.description || null,
      amount: data.amount,
      projectCode: data.projectCode || null,
      salesPersonId: data.salesPersonId || null,
      salesPersonName: data.salesPersonName || null,
      clientName: data.clientName || null,
      createdBy: data.createdBy || user?.fullName || null,
      date: data.date || new Date().toISOString().slice(0, 10),
    },
  });
  await logTxnAudit({
    transactionId: row.id,
    txnId: row.txnId,
    action: "Created",
    details: `${row.type} · NGN ${row.amount} · ${row.description || ""}`,
    user,
    performedBy: data.createdBy || undefined,
  });
  return row;
}