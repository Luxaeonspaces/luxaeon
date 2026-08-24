"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { createTransaction } from "@/lib/txn";
import { logWork } from "@/lib/activity";
import { redirect } from "next/navigation";

export async function addNote(projectId: string, formData: FormData) {
  const { user } = await requireUser();
  const note = String(formData.get("note") || "").trim();
  if (!note) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  if (project.status === "Completed" || project.stage === "Completed") return;
  await prisma.projectNote.create({
    data: { projectId, note, createdBy: user.fullName },
  });
  await logWork(user, "Project Note Added", {
    entityType: "project",
    entityId: project.projectCode,
    details: note.slice(0, 120),
  });
  revalidatePath(`/projects/${project.projectCode}`);
}

/** Only Finance staff, Department Heads, and Founder can edit project details */
export async function updateProjectDetails(projectCode: string, formData: FormData) {
  const { user, perms } = await requireUser();

  const canEdit = perms.isFounder || perms.isHod || perms.isFinance;
  if (!canEdit) {
    redirect(
      `/projects/${projectCode}?error=` +
        encodeURIComponent("Unfortunately you cannot edit project details. Only Finance staff, Heads of Department, and Founder can edit.")
    );
  }

  const existing = await prisma.project.findUnique({ where: { projectCode } });
  if (!existing) throw new Error("Project not found");
  if (existing.status === "Completed" || existing.stage === "Completed") {
    redirect(
      `/projects/${projectCode}?error=` +
        encodeURIComponent("This project is completed and archived. It can no longer be edited.")
    );
  }

  const designFee = Number(String(formData.get("designFee") || existing.designFee).replace(/,/g, ""));
  const amountPaid = Number(String(formData.get("amountPaid") || existing.amountPaid).replace(/,/g, ""));
  const prevPaid = existing.amountPaid || 0;
  const delta = amountPaid - prevPaid;

  await prisma.project.update({
    where: { projectCode },
    data: {
      stage: String(formData.get("stage") || existing.stage),
      status: String(formData.get("status") || existing.status),
      designFee,
      amountPaid,
      location: String(formData.get("location") || "") || null,
      targetHandover: String(formData.get("targetHandover") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });

  if (delta > 0) {
    await createTransaction(
      {
        type: "Income",
        category: "Design Fee",
        description: `Payment update for ${projectCode} · ${existing.clientName}`,
        amount: delta,
        projectCode,
        salesPersonId: existing.salesPersonId,
        salesPersonName: existing.salesPersonName,
        clientName: existing.clientName,
        createdBy: user.fullName,
      },
      user
    );
    if (existing.salesPersonId) {
      const target = await prisma.salesTarget.findFirst({
        where: { userId: existing.salesPersonId },
        orderBy: { createdAt: "desc" },
      });
      if (target) {
        await prisma.salesTarget.update({
          where: { id: target.id },
          data: { achievedAmount: (target.achievedAmount || 0) + delta },
        });
      }
    }
  }

  await logWork(user, "Project Updated", {
    entityType: "project",
    entityId: projectCode,
    details: `Stage ${formData.get("stage") || existing.stage}`,
  });

  revalidatePath(`/projects/${projectCode}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/finance");
  revalidatePath("/sales-targets");
  redirect(`/projects/${projectCode}?ok=` + encodeURIComponent("Project saved"));
}


/** Record a payment against the project — receipt attachment required */
export async function recordProjectPayment(projectCode: string, formData: FormData) {
  const { user, perms } = await requireUser();
  const canPay = perms.isFounder || perms.isHod || perms.isFinance;
  if (!canPay) {
    redirect(
      `/projects/${projectCode}?error=` +
        encodeURIComponent("Only Finance, HOD, or Founder can record payments")
    );
  }

  const amount = Number(String(formData.get("amount") || "0").replace(/,/g, ""));
  const note = String(formData.get("note") || "").trim();
  const file = formData.get("receipt") as File | null;
  if (amount <= 0) {
    redirect(`/projects/${projectCode}?error=` + encodeURIComponent("Enter a valid payment amount"));
  }
  if (!file || typeof file === "string" || !file.size) {
    redirect(
      `/projects/${projectCode}?error=` +
        encodeURIComponent("Payment receipt is required for each payment record")
    );
  }

  const existing = await prisma.project.findUnique({ where: { projectCode } });
  if (!existing) throw new Error("Project not found");
  if (existing.status === "Completed" || existing.stage === "Completed") {
    redirect(
      `/projects/${projectCode}?error=` +
        encodeURIComponent("Completed projects cannot receive new payment records.")
    );
  }

  const newPaid = (existing.amountPaid || 0) + amount;
  await prisma.project.update({
    where: { projectCode },
    data: { amountPaid: newPaid },
  });

  const txn = await createTransaction(
    {
      type: "Income",
      category: "Design Fee",
      description: note
        ? `Payment · ${projectCode} · ${note}`
        : `Payment received · ${projectCode} · ${existing.clientName}`,
      amount,
      projectCode,
      salesPersonId: existing.salesPersonId,
      salesPersonName: existing.salesPersonName,
      clientName: existing.clientName,
      createdBy: user.fullName,
    },
    user
  );

  // Save receipt against transaction
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "storage", "finance_docs");
  await mkdir(dir, { recursive: true });
  const safe = `RCPT_${txn.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safe), buf);
  await prisma.transactionDocument.create({
    data: {
      transactionId: txn.id,
      filename: safe,
      originalName: file.name,
      category: "Payment Receipt",
      uploadedBy: user.fullName,
    },
  });

  if (existing.salesPersonId) {
    const target = await prisma.salesTarget.findFirst({
      where: { userId: existing.salesPersonId },
      orderBy: { createdAt: "desc" },
    });
    if (target) {
      await prisma.salesTarget.update({
        where: { id: target.id },
        data: { achievedAmount: (target.achievedAmount || 0) + amount },
      });
    }
  }

  await logWork(user, "Project Payment Recorded", {
    entityType: "project",
    entityId: projectCode,
    details: `NGN ${amount} · receipt ${file.name}`,
  });

  revalidatePath(`/projects/${projectCode}`);
  revalidatePath("/projects");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  revalidatePath("/sales-targets");
  redirect(
    `/projects/${projectCode}?ok=` +
      encodeURIComponent(`Payment of NGN ${amount.toLocaleString()} recorded with receipt`)
  );
}

/** Correct a payment record (amount/description) — adjusts project paid total */
export async function editProjectPayment(projectCode: string, formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isFounder && !perms.isFinance && !perms.isHod) {
    redirect(`/projects/${projectCode}?error=` + encodeURIComponent("Not allowed to edit payments"));
  }
  const projLock = await prisma.project.findUnique({ where: { projectCode } });
  if (projLock && (projLock.status === "Completed" || projLock.stage === "Completed")) {
    redirect(`/projects/${projectCode}?error=` + encodeURIComponent("Completed projects are locked."));
  }
  const txnId = String(formData.get("txnId") || "");
  const txn = await prisma.transaction.findUnique({ where: { id: txnId } });
  if (!txn || txn.projectCode !== projectCode || txn.type !== "Income") {
    redirect(`/projects/${projectCode}?error=` + encodeURIComponent("Payment record not found"));
  }

  const newAmount = Number(String(formData.get("amount") || txn.amount).replace(/,/g, ""));
  if (newAmount <= 0) {
    redirect(`/projects/${projectCode}?error=` + encodeURIComponent("Invalid amount"));
  }
  const delta = newAmount - txn.amount;
  const note = String(formData.get("description") || txn.description || "");

  await prisma.transaction.update({
    where: { id: txnId },
    data: {
      amount: newAmount,
      description: note,
    },
  });

  const project = await prisma.project.findUnique({ where: { projectCode } });
  if (project) {
    await prisma.project.update({
      where: { projectCode },
      data: { amountPaid: Math.max(0, (project.amountPaid || 0) + delta) },
    });
  }

  // Optional new receipt on edit
  const file = formData.get("receipt") as File | null;
  if (file && typeof file !== "string" && file.size) {
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "storage", "finance_docs");
    await mkdir(dir, { recursive: true });
    const safe = `RCPT_${txn.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
    await prisma.transactionDocument.create({
      data: {
        transactionId: txn.id,
        filename: safe,
        originalName: file.name,
        category: "Payment Receipt",
        uploadedBy: user.fullName,
      },
    });
  }

  await logWork(user, "Project Payment Edited", {
    entityType: "project",
    entityId: projectCode,
    details: `Txn ${txn.txnId} → NGN ${newAmount}`,
  });

  revalidatePath(`/projects/${projectCode}`);
  revalidatePath("/finance");
  redirect(`/projects/${projectCode}?ok=` + encodeURIComponent("Payment record updated"));
}


/** Mark project completed → locked & moved to Project Archives */
export async function completeProject(projectCode: string, formData?: FormData) {
  const { user, perms } = await requireUser();
  const canComplete = perms.isFounder || perms.isHod || perms.isFinance || perms.isDesign;
  if (!canComplete) {
    redirect(
      `/projects/${projectCode}?error=` +
        encodeURIComponent("You are not allowed to mark this project completed.")
    );
  }
  const existing = await prisma.project.findUnique({ where: { projectCode } });
  if (!existing) throw new Error("Project not found");
  if (existing.status === "Completed") {
    redirect(`/projects/${projectCode}?ok=` + encodeURIComponent("Already completed"));
  }

  await prisma.project.update({
    where: { projectCode },
    data: {
      status: "Completed",
      stage: "Completed",
    },
  });

  await logWork(user, "Project Completed", {
    entityType: "project",
    entityId: projectCode,
    details: `${existing.clientName} · archived`,
  });

  revalidatePath(`/projects/${projectCode}`);
  revalidatePath("/projects");
  revalidatePath("/archive");
  revalidatePath("/dashboard");
  redirect(
    `/archive?ok=` +
      encodeURIComponent(`${projectCode} marked completed and moved to Project Archives`)
  );
}
