"use server";

import { requireUser } from "@/lib/session";
import { createTransaction } from "@/lib/txn";
import { revalidatePath } from "next/cache";

export async function addTransaction(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canSeeFinance) throw new Error("Not allowed");
  const amount = Number(formData.get("amount") || 0);
  if (amount <= 0) return;
  await createTransaction(
    {
      type: String(formData.get("type") || "Expense"),
      category: String(formData.get("category") || "") || null,
      description: String(formData.get("description") || "") || null,
      amount,
      projectCode: String(formData.get("projectCode") || "") || null,
      clientName: String(formData.get("clientName") || "") || null,
      createdBy: user.fullName,
    },
    user
  );
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
