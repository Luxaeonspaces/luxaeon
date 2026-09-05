import { prisma } from "./prisma";

export async function logTxnAudit({
  transactionId,
  txnId,
  action,
  details,
  user,
  performedBy = null,
}) {
  try {
    await prisma.transactionAudit.create({
      data: {
        transactionId: transactionId || null,
        txnId: txnId || null,
        action,
        details: details || null,
        performedBy: user?.fullName || performedBy || null,
        performedById: user?.id || null,
        role: user?.role || null,
        department: user?.department || null,
      },
    });
  } catch (e) {
    console.error("txn audit failed", e);
  }
}