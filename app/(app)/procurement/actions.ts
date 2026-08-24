"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { logWork } from "@/lib/activity";
import { createTransaction } from "@/lib/txn";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Design, Procurement, Founder, HOD can request */
export async function requestProcurement(formData: FormData) {
  const { user, perms } = await requireUser();
  const canRequest =
    perms.isFounder ||
    perms.isProcurement ||
    perms.isDesign ||
    perms.isHod ||
    perms.canRequestProcurement;
  if (!canRequest) throw new Error("Not allowed");

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  const row = await prisma.procurementRequest.create({
    data: {
      title,
      description: String(formData.get("description") || "") || null,
      category: String(formData.get("category") || "") || null,
      projectCode: String(formData.get("projectCode") || "") || null,
      estimatedCost: Number(String(formData.get("estimatedCost") || "0").replace(/,/g, "")),
      vendorPreferred: String(formData.get("vendorPreferred") || "") || null,
      payeeName: String(formData.get("payeeName") || "") || null,
      payeeBankName: String(formData.get("payeeBankName") || "") || null,
      payeeAccountNo: String(formData.get("payeeAccountNo") || "") || null,
      payeeAccountName: String(formData.get("payeeAccountName") || "") || null,
      requestedBy: user.fullName,
      requestedById: user.id,
      department: user.department || null,
      status: "Pending Procurement HOD",
    },
  });
  await logWork(user, "Procurement Requested", { entityType: "procurement", entityId: row.id, details: title });
  revalidatePath("/procurement");
  redirect(`/procurement?created=${row.id}&ok=` + encodeURIComponent("Submitted. Upload supporting docs, then Procurement HOD reviews."));
}

/** Head of Procurement processes / first approval */
export async function hodApproveProcurement(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isFounder && !(perms.isHod && perms.isProcurement)) {
    throw new Error("Only Head of Procurement (or Founder) can approve at this step");
  }
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "approve");
  const note = String(formData.get("note") || "");
  await prisma.procurementRequest.update({
    where: { id },
    data: {
      status: decision === "approve" ? "Pending Founder" : "Rejected",
      hodApprovedBy: user.fullName,
      hodNote: note || null,
      hodDate: new Date().toISOString(),
      processedBy: user.fullName,
      processedAt: new Date().toISOString(),
      procurementNote: note || null,
    },
  });
  revalidatePath("/procurement");
}

export async function founderApproveProcurement(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isFounder) throw new Error("Founder only");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "approve");
  const note = String(formData.get("note") || "");
  await prisma.procurementRequest.update({
    where: { id },
    data: {
      status: decision === "approve" ? "Pending Finance" : "Rejected",
      founderApprovedBy: user.fullName,
      founderNote: note || null,
      founderDate: new Date().toISOString(),
    },
  });
  revalidatePath("/procurement");
}

export async function financeDisburseProcurement(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isHeadOfFinance) throw new Error("Only Head of Finance can disburse");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "release");
  const note = String(formData.get("note") || "");
  const row = await prisma.procurementRequest.findUnique({ where: { id } });
  if (!row || row.status !== "Pending Finance") return;

  if (decision === "reject") {
    await prisma.procurementRequest.update({
      where: { id },
      data: {
        status: "Rejected",
        financeReleasedBy: user.fullName,
        financeNote: note || null,
        financeDate: new Date().toISOString(),
      },
    });
    revalidatePath("/procurement");
    return;
  }

  const txn = await createTransaction(
    {
      type: "Expense",
      category: "Procurement",
      description: `${row.title} · ${row.projectCode || ""} · ${row.payeeName || row.vendorPreferred || ""}`,
      amount: row.estimatedCost,
      projectCode: row.projectCode,
      createdBy: user.fullName,
    },
    user
  );

  await prisma.procurementRequest.update({
    where: { id },
    data: {
      status: "Disbursed",
      financeReleasedBy: user.fullName,
      financeNote: note || null,
      financeDate: new Date().toISOString(),
      linkedTxnId: txn.txnId,
    },
  });
  revalidatePath("/procurement");
  revalidatePath("/finance");
}


/** Maker or Procurement HOD can edit while Pending Procurement HOD */
export async function editProcurement(formData: FormData) {
  const { user, perms } = await requireUser();
  const id = String(formData.get("id") || "");
  const row = await prisma.procurementRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");
  if (row.status !== "Pending Procurement HOD") {
    throw new Error("Only editable before Head of Procurement approval");
  }
  const isMaker =
    (row as any).requestedById === user.id || row.requestedBy === user.fullName;
  const isProcHod = perms.isFounder || (perms.isHod && perms.isProcurement);
  if (!isMaker && !isProcHod) {
    throw new Error("Only the maker or Head of Procurement can edit this request");
  }

  await prisma.procurementRequest.update({
    where: { id },
    data: {
      title: String(formData.get("title") || row.title),
      description: String(formData.get("description") || "") || null,
      category: String(formData.get("category") || "") || null,
      projectCode: String(formData.get("projectCode") || "") || null,
      estimatedCost: Number(String(formData.get("estimatedCost") || row.estimatedCost).replace(/,/g, "")),
      vendorPreferred: String(formData.get("vendorPreferred") || "") || null,
      payeeName: String(formData.get("payeeName") || "") || null,
      payeeBankName: String(formData.get("payeeBankName") || "") || null,
      payeeAccountNo: String(formData.get("payeeAccountNo") || "") || null,
      payeeAccountName: String(formData.get("payeeAccountName") || "") || null,
    },
  });
  revalidatePath("/procurement");
  redirect("/procurement?ok=" + encodeURIComponent("Procurement request updated"));
}




/** RECALL — previous approval level */
export async function recallProcurement(formData: FormData) {
  const { user, perms } = await requireUser();
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  const row = await prisma.procurementRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");

  const previous: Record<string, string> = {
    "Pending Finance": "Pending Founder",
    "Pending Founder": "Pending Procurement HOD",
    "Pending Procurement HOD": "Recalled",
  };
  if (!previous[row.status]) {
    throw new Error("Cannot recall from this stage");
  }

  const isMaker =
    (row as any).requestedById === user.id || row.requestedBy === user.fullName;
  let allowed = false;
  if (row.status === "Pending Finance") {
    allowed = perms.isFounder || perms.isHeadOfFinance;
  } else if (row.status === "Pending Founder") {
    allowed = perms.isFounder || (perms.isHod && perms.isProcurement);
  } else if (row.status === "Pending Procurement HOD") {
    allowed = perms.isFounder || isMaker || (perms.isHod && perms.isProcurement);
  }
  if (!allowed) throw new Error("Not allowed to recall at this stage");

  const nextStatus = previous[row.status];
  const note = reason
    ? `Recalled by ${user.fullName} → ${nextStatus}: ${reason}`
    : `Recalled by ${user.fullName} → ${nextStatus}`;

  await prisma.procurementRequest.update({
    where: { id },
    data: {
      status: nextStatus,
      ...(row.status === "Pending Finance"
        ? { financeNote: note, financeDate: new Date().toISOString() }
        : row.status === "Pending Founder"
          ? { founderNote: note, founderDate: new Date().toISOString() }
          : { hodNote: note, hodDate: new Date().toISOString() }),
    },
  });
  revalidatePath("/procurement");
  redirect("/procurement?ok=" + encodeURIComponent(`Recalled to: ${nextStatus}`));
}

/** CANCEL — void requisition */
export async function cancelProcurement(formData: FormData) {
  const { user, perms } = await requireUser();
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  const row = await prisma.procurementRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");

  const cancellable = [
    "Pending Procurement HOD",
    "Pending Founder",
    "Pending Finance",
    "Recalled",
  ];
  if (!cancellable.includes(row.status)) {
    throw new Error("Cannot cancel at this stage");
  }

  const isMaker =
    (row as any).requestedById === user.id || row.requestedBy === user.fullName;
  if (
    !perms.isFounder &&
    !perms.isHeadOfFinance &&
    !isMaker &&
    !(perms.isHod && perms.isProcurement)
  ) {
    throw new Error("Not allowed to cancel");
  }

  await prisma.procurementRequest.update({
    where: { id },
    data: {
      status: "Cancelled",
      financeNote: reason
        ? `CANCELLED (void) by ${user.fullName}: ${reason}`
        : `CANCELLED (void) by ${user.fullName}`,
      financeDate: new Date().toISOString(),
    },
  });
  revalidatePath("/procurement");
  redirect("/procurement?ok=" + encodeURIComponent("Requisition cancelled (voided)"));
}

export async function resubmitProcurement(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id") || "");
  const row = await prisma.procurementRequest.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");
  if (row.status !== "Recalled") throw new Error("Only recalled requests can be resubmitted");
  const isMaker =
    (row as any).requestedById === user.id || row.requestedBy === user.fullName;
  if (!isMaker) throw new Error("Only the maker can resubmit");

  await prisma.procurementRequest.update({
    where: { id },
    data: {
      status: "Pending Procurement HOD",
      hodNote: `Resubmitted by ${user.fullName}`,
      hodDate: new Date().toISOString(),
    },
  });
  revalidatePath("/procurement");
  redirect("/procurement?ok=" + encodeURIComponent("Resubmitted to Procurement HOD"));
}
