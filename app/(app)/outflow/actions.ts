"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { logWork } from "@/lib/activity";
import { createTransaction } from "@/lib/txn";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOutflow(formData: FormData) {
  const { user } = await requireUser();
  const description = String(formData.get("description") || "").trim();
  const amount = Number(String(formData.get("amount") || "0").replace(/,/g, ""));
  if (!description || amount <= 0) {
    redirect("/outflow?error=" + encodeURIComponent("Description and amount required"));
  }

  const row = await prisma.outflowRequest.create({
    data: {
      requestedBy: user.fullName,
      requestedById: user.id,
      department: String(formData.get("department") || user.department || ""),
      description,
      category: String(formData.get("category") || ""),
      amount,
      vendor: String(formData.get("vendor") || "") || null,
      projectCode: String(formData.get("projectCode") || "") || null,
      payeeName: String(formData.get("payeeName") || "") || null,
      payeeBankName: String(formData.get("payeeBankName") || "") || null,
      payeeAccountNo: String(formData.get("payeeAccountNo") || "") || null,
      payeeAccountName: String(formData.get("payeeAccountName") || "") || null,
      status: "Pending Department",
    },
  });
  await logWork(user, "Outflow Requested", {
    entityType: "outflow",
    entityId: row.id,
    details: `${description} · NGN ${amount}`,
  });
  revalidatePath("/outflow");
  redirect(`/outflow?created=${row.id}&ok=` + encodeURIComponent("Request submitted. Upload supporting documents if needed."));
}

export async function decideDept(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canDeptApprove) throw new Error("Not allowed");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  const note = String(formData.get("note") || "");
  const now = new Date().toISOString();
  const row = await prisma.outflowRequest.findUnique({ where: { id } });
  if (!row || row.status !== "Pending Department") return;

  // Only maker's HOD (same department) — Founder can also step in
  if (!perms.isFounder) {
    if (!perms.isHod) throw new Error("Only Head of Department can approve at this step");
    if (row.department && user.department && row.department !== user.department) {
      throw new Error("Only the maker's Head of Department can approve this request");
    }
  }

  await prisma.outflowRequest.update({
    where: { id },
    data: {
      status: decision === "approve" ? "Pending Founder" : "Rejected",
      deptApprovedBy: user.fullName,
      deptNote: note,
      deptDate: now,
    },
  });
  revalidatePath("/outflow");
}

export async function decideFinal(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canFinalApprove) throw new Error("Not allowed");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  const note = String(formData.get("note") || "");
  const now = new Date().toISOString();
  await prisma.outflowRequest.update({
    where: { id },
    data: {
      status: decision === "approve" ? "Pending Finance" : "Rejected",
      finalApprovedBy: user.fullName,
      finalNote: note,
      finalDate: now,
    },
  });
  revalidatePath("/outflow");
}

export async function releaseFunds(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isHeadOfFinance) throw new Error("Only Head of Finance can release funds");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "release");
  const note = String(formData.get("note") || "");
  const now = new Date().toISOString();
  const row = await prisma.outflowRequest.findUnique({ where: { id } });
  if (!row || row.status !== "Pending Finance") return;

  if (decision === "reject") {
    await prisma.outflowRequest.update({
      where: { id },
      data: { status: "Rejected", financeReleasedBy: user.fullName, financeNote: note, financeDate: now },
    });
    revalidatePath("/outflow");
    return;
  }

  const txn = await createTransaction(
    {
      type: "Expense",
      category: row.category || "Outflow",
      description: `${row.description} · Payee: ${row.payeeName || row.vendor || "—"} · ${row.payeeBankName || ""} ${row.payeeAccountNo || ""}`,
      amount: row.amount,
      projectCode: row.projectCode,
      createdBy: user.fullName,
    },
    user
  );

  await prisma.outflowRequest.update({
    where: { id },
    data: {
      status: "Disbursed",
      financeReleasedBy: user.fullName,
      financeNote: note,
      financeDate: now,
      linkedTxnId: txn.txnId,
    },
  });
  revalidatePath("/outflow");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}


/** Maker or HOD can edit while still Pending Department */
export async function editOutflow(formData: FormData) {
  const { user, perms } = await requireUser();
  const id = String(formData.get("id") || "");
  const row = await prisma.outflowRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");
  if (row.status !== "Pending Department") {
    throw new Error("Only editable before Head of Department approval");
  }
  const isMaker =
    row.requestedById === user.id || row.requestedBy === user.fullName;
  const isDeptHod =
    perms.isHod &&
    (!row.department || !user.department || row.department === user.department);
  if (!perms.isFounder && !isMaker && !isDeptHod) {
    throw new Error("Only the maker or department HOD can edit this request");
  }

  const amount = Number(String(formData.get("amount") || row.amount).replace(/,/g, ""));
  await prisma.outflowRequest.update({
    where: { id },
    data: {
      description: String(formData.get("description") || row.description),
      category: String(formData.get("category") || row.category || "") || null,
      amount: amount > 0 ? amount : row.amount,
      vendor: String(formData.get("vendor") || "") || null,
      projectCode: String(formData.get("projectCode") || "") || null,
      payeeName: String(formData.get("payeeName") || "") || null,
      payeeBankName: String(formData.get("payeeBankName") || "") || null,
      payeeAccountNo: String(formData.get("payeeAccountNo") || "") || null,
      payeeAccountName: String(formData.get("payeeAccountName") || "") || null,
      department: String(formData.get("department") || row.department || "") || null,
    },
  });
  revalidatePath("/outflow");
  redirect("/outflow?ok=" + encodeURIComponent("Request updated (before HOD approval)"));
}




/** RECALL — send back to previous approval level (not voided) */
export async function recallOutflow(formData: FormData) {
  const { user, perms } = await requireUser();
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  const row = await prisma.outflowRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");

  // Map: current status → previous status
  const previous: Record<string, string> = {
    "Pending Finance": "Pending Founder",
    "Pending Founder": "Pending Department",
    "Pending Department": "Recalled", // back to maker to fix & resubmit
  };
  if (!previous[row.status]) {
    throw new Error("This request cannot be recalled from its current stage");
  }

  const isMaker = row.requestedById === user.id || row.requestedBy === user.fullName;
  const isDeptHod =
    perms.isHod &&
    (!row.department || !user.department || row.department === user.department);

  // Who may recall at each stage
  let allowed = false;
  if (row.status === "Pending Finance") {
    allowed = perms.isFounder || perms.isHeadOfFinance;
  } else if (row.status === "Pending Founder") {
    allowed = perms.isFounder || isDeptHod;
  } else if (row.status === "Pending Department") {
    allowed = perms.isFounder || isMaker || isDeptHod;
  }
  if (!allowed) {
    throw new Error("You are not allowed to recall this request at this stage");
  }

  const nextStatus = previous[row.status];
  const note = reason
    ? `Recalled by ${user.fullName} → ${nextStatus}: ${reason}`
    : `Recalled by ${user.fullName} → ${nextStatus}`;

  await prisma.outflowRequest.update({
    where: { id },
    data: {
      status: nextStatus,
      // keep trail on financeNote / finalNote / deptNote depending on stage
      ...(row.status === "Pending Finance"
        ? { financeNote: note, financeDate: new Date().toISOString() }
        : row.status === "Pending Founder"
          ? { finalNote: note, finalDate: new Date().toISOString() }
          : { deptNote: note, deptDate: new Date().toISOString() }),
    },
  });
  revalidatePath("/outflow");
  redirect(
    "/outflow?ok=" +
      encodeURIComponent(`Recalled to previous level: ${nextStatus}`)
  );
}

/** CANCEL — void the requisition permanently */
export async function cancelOutflow(formData: FormData) {
  const { user, perms } = await requireUser();
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  const row = await prisma.outflowRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");

  const cancellable = ["Pending Department", "Pending Founder", "Pending Finance", "Recalled"];
  if (!cancellable.includes(row.status)) {
    throw new Error("This voucher can no longer be cancelled");
  }

  const isMaker = row.requestedById === user.id || row.requestedBy === user.fullName;
  const isDeptHod =
    perms.isHod &&
    (!row.department || !user.department || row.department === user.department);
  if (!perms.isFounder && !perms.isHeadOfFinance && !isMaker && !isDeptHod) {
    throw new Error("Not allowed to cancel this voucher");
  }

  await prisma.outflowRequest.update({
    where: { id },
    data: {
      status: "Cancelled",
      financeNote: reason
        ? `CANCELLED (void) by ${user.fullName}: ${reason}`
        : `CANCELLED (void) by ${user.fullName}`,
      financeDate: new Date().toISOString(),
    },
  });
  revalidatePath("/outflow");
  redirect("/outflow?ok=" + encodeURIComponent("Requisition cancelled (voided)"));
}

/** Maker resubmits after Recall → Pending Department */
export async function resubmitOutflow(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id") || "");
  const row = await prisma.outflowRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");
  if (row.status !== "Recalled") throw new Error("Only recalled requests can be resubmitted");
  const isMaker = row.requestedById === user.id || row.requestedBy === user.fullName;
  if (!isMaker) throw new Error("Only the maker can resubmit");

  await prisma.outflowRequest.update({
    where: { id },
    data: {
      status: "Pending Department",
      deptNote: `Resubmitted by ${user.fullName}`,
      deptDate: new Date().toISOString(),
    },
  });
  revalidatePath("/outflow");
  redirect("/outflow?ok=" + encodeURIComponent("Resubmitted to department HOD"));
}
