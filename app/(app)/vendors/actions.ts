"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function addVendor(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.vendor.create({
    data: {
      name,
      category: String(formData.get("category") || "") || null,
      phone: String(formData.get("phone") || "") || null,
    },
  });
  revalidateTag("vendors");
  revalidatePath("/vendors");
  redirect("/vendors?ok=" + encodeURIComponent("Vendor saved"));
}