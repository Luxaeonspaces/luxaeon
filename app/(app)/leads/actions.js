"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logWork } from "@/lib/activity";

export async function createLead(formData) {
  const { user } = await requireUser();

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) return;

  const email =
    String(formData.get("email") || "").trim() || null;

  let ownerUserId =
    String(formData.get("ownerUserId") || "") || null;

  let ownerName =
    String(formData.get("ownerName") || "") || null;

  if (
    !ownerUserId &&
    user.department &&
    ["Sales & Marketing", "Sales", "Marketing"].includes(
      user.department
    )
  ) {
    ownerUserId = user.id;
    ownerName = user.fullName;
  } else if (ownerUserId) {
    const owner = await prisma.user.findUnique({
      where: {
        id: ownerUserId,
      },
    });

    ownerName = owner?.fullName || ownerName;
  }

  await prisma.lead.create({
    data: {
      fullName,
      email,
      phone: String(formData.get("phone") || "") || null,
      location: String(formData.get("location") || "") || null,
      source: String(formData.get("source") || "") || null,
      status: String(formData.get("status") || "New"),
      notes: String(formData.get("notes") || "") || null,
      ownerUserId,
      ownerName,
    },
  });

  await logWork(user, "Lead Generated", {
    entityType: "lead",
    details: `${fullName}${
      ownerName ? ` · Owner: ${ownerName}` : ""
    }`,
  });

  revalidatePath("/leads");
  revalidatePath("/sales-targets");
  revalidatePath("/dashboard");

  redirect(
    "/leads?ok=" + encodeURIComponent("Lead saved")
  );
}