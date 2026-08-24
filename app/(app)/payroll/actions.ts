"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createTransaction } from "@/lib/txn";
import { logTxnAudit } from "@/lib/txnAudit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** HR: one batch for the period — many employee lines, one cumulative total */
export async function preparePayroll(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageHr) throw new Error("Not allowed");
  const period = String(formData.get("period") || "").trim();
  if (!period) return;

  const staff = await prisma.user.findMany({
    where: { active: true },
    include: { profile: true },
  });
  const lines = staff
    .map((s) => {
      const basic = s.profile?.salaryAmount || 0;
      const allowances = Number(String(formData.get("allowances") || "0").replace(/,/g, ""));
      const deductions = Number(String(formData.get("deductions") || "0").replace(/,/g, ""));
      return {
        userId: s.id,
        employeeName: s.fullName,
        period,
        basicSalary: basic,
        allowances,
        deductions,
        netPay: basic + allowances - deductions,
      };
    })
    .filter((l) => l.basicSalary > 0);

  if (!lines.length) {
    redirect("/payroll?error=" + encodeURIComponent("No staff with salary set in HR profiles"));
  }

  const totalNet = lines.reduce((a, l) => a + l.netPay, 0);
  const batch = await prisma.payrollBatch.create({
    data: {
      period,
      status: "Pending Founder",
      totalNet,
      employeeCount: lines.length,
      preparedBy: user.fullName,
      records: {
        create: lines.map((l) => ({
          userId: l.userId,
          employeeName: l.employeeName,
          period: l.period,
          basicSalary: l.basicSalary,
          allowances: l.allowances,
          deductions: l.deductions,
          netPay: l.netPay,
          status: "Submitted",
          preparedBy: user.fullName,
        })),
      },
    },
  });

  revalidatePath("/payroll");
  redirect(
    "/payroll?ok=" +
      encodeURIComponent(
        `Payroll batch for ${period}: ${lines.length} staff, total ₦${totalNet.toLocaleString()} — sent to Founder`
      )
  );
}

/** Founder approves batch → Head of Finance */
export async function founderApproveBatch(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isFounder) throw new Error("Founder only");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "approve");
  if (decision === "reject") {
    await prisma.payrollBatch.update({
      where: { id },
      data: { status: "Rejected", founderApprovedBy: user.fullName, founderApprovedAt: new Date().toISOString() },
    });
  } else {
    await prisma.payrollBatch.update({
      where: { id },
      data: {
        status: "Approved",
        founderApprovedBy: user.fullName,
        founderApprovedAt: new Date().toISOString(),
      },
    });
    await prisma.payrollRecord.updateMany({
      where: { batchId: id },
      data: { status: "Approved", approvedBy: user.fullName, approvedAt: new Date().toISOString() },
    });
  }
  revalidatePath("/payroll");
}

/** Head of Finance: one cumulative expense transaction for entire batch */
export async function disburseBatch(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canDisburseFunds || !perms.isHeadOfFinance) {
    throw new Error("Only Head of Finance can disburse payroll");
  }
  const id = String(formData.get("id"));
  const batch = await prisma.payrollBatch.findUnique({
    where: { id },
    include: { records: true },
  });
  if (!batch || batch.status !== "Approved") return;
  if (batch.linkedTxnId) return;

  const txn = await createTransaction(
    {
      type: "Expense",
      category: "Payroll",
      description: `Payroll batch · ${batch.period} · ${batch.employeeCount} employees · prepared by ${batch.preparedBy}`,
      amount: batch.totalNet,
      createdBy: user.fullName,
    },
    user
  );

  await prisma.payrollBatch.update({
    where: { id },
    data: {
      status: "Paid",
      paidBy: user.fullName,
      paidAt: new Date().toISOString(),
      linkedTxnId: txn.txnId,
    },
  });
  await prisma.payrollRecord.updateMany({
    where: { batchId: id },
    data: { status: "Paid", paidBy: user.fullName, paidAt: new Date().toISOString(), linkedTxnId: txn.txnId },
  });
  await logTxnAudit({
    transactionId: txn.id,
    txnId: txn.txnId,
    action: "Linked Payroll",
    details: `Batch ${batch.period} · ${batch.employeeCount} staff · NGN ${batch.totalNet}`,
    user,
  });
  revalidatePath("/payroll");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
