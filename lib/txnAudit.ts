import { prisma } from "./prisma";
import type { SessionUser } from "./rbac";

export async function logTxnAudit(opts: {
  transactionId?: string | null;
  txnId?: string | null;
  action: string;
  details?: string;
  user?: SessionUser | null;
  performedBy?: string;
}) {
  try {
    await prisma.transactionAudit.create({
      data: {
        transactionId: opts.transactionId || null,
        txnId: opts.txnId || null,
        action: opts.action,
        details: opts.details || null,
        performedBy: opts.user?.fullName || opts.performedBy || null,
        performedById: opts.user?.id || null,
        role: opts.user?.role || null,
        department: opts.user?.department || null,
      },
    });
  } catch (e) {
    console.error("txn audit failed", e);
  }
}
