"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createTransaction } from "@/lib/txn";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setTarget(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canSetSalesTargets && !perms.isFounder) throw new Error("Not allowed");
  if (!perms.canManageSalesTargets) throw new Error("Sales only");

  const userId = String(formData.get("userId"));
  const employee = await prisma.user.findUnique({ where: { id: userId } });
  if (!employee) return;

  await prisma.salesTarget.create({
    data: {
      userId,
      employeeName: employee.fullName,
      period: String(formData.get("period") || ""),
      targetAmount: Number(String(formData.get("targetAmount") || "0").replace(/,/g, "")),
      achievedAmount: Number(String(formData.get("achievedAmount") || "0").replace(/,/g, "")),
      leadsTarget: Number(formData.get("leadsTarget") || 0),
      leadsAchieved: Number(formData.get("leadsAchieved") || 0),
      notes: String(formData.get("notes") || "") || null,
      setBy: user.fullName,
    },
  });
  revalidatePath("/sales-targets");
  revalidatePath("/dashboard");
  redirect("/sales-targets?ok=" + encodeURIComponent("Target saved"));
}

export async function updateAchievement(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageSalesTargets) throw new Error("Not allowed");
  const id = String(formData.get("id"));
  const existing = await prisma.salesTarget.findUnique({ where: { id } });
  if (!existing) return;

  if (existing.userId !== user.id && !perms.isFounder && !perms.isHeadOfSales) {
    throw new Error("Not allowed to update this target");
  }

  const newAchieved = Number(String(formData.get("achievedAmount") || existing.achievedAmount).replace(/,/g, ""));
  const newLeads = Number(formData.get("leadsAchieved") || existing.leadsAchieved);
  const prev = existing.achievedAmount || 0;
  const delta = newAchieved - prev;
  const postFinance = formData.get("postFinance") === "on" || formData.get("postFinance") === "true";

  await prisma.salesTarget.update({
    where: { id },
    data: {
      achievedAmount: newAchieved,
      leadsAchieved: newLeads,
    },
  });

  // Only post income if explicitly requested — project payments already post once via project create/update
  if (delta > 0 && postFinance) {
    await createTransaction({
      type: "Income",
      category: "Sales Target Achievement",
      description: `Sales closed by ${existing.employeeName} · ${existing.period}`,
      amount: delta,
      salesPersonId: existing.userId,
      salesPersonName: existing.employeeName,
      createdBy: user.fullName,
    });
  }

  revalidatePath("/sales-targets");
  revalidatePath("/dashboard");
  revalidatePath("/finance");
}
