import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/excel";
import { getPerms } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const u = session.user as any;
  const perms = getPerms({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    department: u.department,
  });
  if (!perms.canManageHr && !perms.canSeeFinance && !perms.isFounder) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const batchId = new URL(req.url).searchParams.get("batchId");
  const all = new URL(req.url).searchParams.get("all") === "1";

  if (batchId) {
    const batch = await prisma.payrollBatch.findUnique({
      where: { id: batchId },
      include: { records: true },
    });
    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    const rows = [
      ["Luxaeon Spaces — Payroll Export"],
      ["Period", batch.period],
      ["Status", batch.status],
      ["Prepared by", batch.preparedBy || ""],
      ["Employee count", batch.employeeCount],
      ["Total net (₦)", batch.totalNet],
      ["Linked Txn", batch.linkedTxnId || ""],
      [],
      ["Employee", "User ID", "Basic (₦)", "Allowances (₦)", "Deductions (₦)", "Net (₦)", "Status", "Paid by", "Paid at"],
      ...batch.records.map((r) => [
        r.employeeName,
        r.userId,
        r.basicSalary,
        r.allowances,
        r.deductions,
        r.netPay,
        r.status,
        r.paidBy || "",
        r.paidAt || "",
      ]),
    ];
    return csvResponse(`Luxaeon_Payroll_${batch.period.replace(/\s+/g, "_")}.csv`, rows);
  }

  if (all) {
    const records = await prisma.payrollRecord.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    const rows = [
      ["Luxaeon Spaces — All Payroll Records"],
      ["Exported", new Date().toISOString()],
      [],
      ["Employee", "Period", "Basic (₦)", "Allowances (₦)", "Deductions (₦)", "Net (₦)", "Status", "Prepared by", "Approved by", "Paid by", "Txn"],
      ...records.map((r) => [
        r.employeeName,
        r.period,
        r.basicSalary,
        r.allowances,
        r.deductions,
        r.netPay,
        r.status,
        r.preparedBy || "",
        r.approvedBy || "",
        r.paidBy || "",
        r.linkedTxnId || "",
      ]),
    ];
    return csvResponse("Luxaeon_Payroll_All.csv", rows);
  }

  return NextResponse.json({ error: "batchId or all=1 required" }, { status: 400 });
}
