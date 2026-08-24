"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FLAGS = [
  "offerLetter",
  "contractSigned",
  "idCollected",
  "bankDetails",
  "systemAccess",
  "orientation",
  "toolsIssued",
  "policyAcknowledged",
  "mentorAssigned",
] as const;

export async function startOnboarding(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageOnboarding) throw new Error("Not allowed");
  const userId = String(formData.get("userId"));
  const employee = await prisma.user.findUnique({ where: { id: userId } });
  if (!employee) return;
  await prisma.onboardingChecklist.create({
    data: {
      userId,
      employeeName: employee.fullName,
      status: "In Progress",
      startedBy: user.fullName,
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath("/onboarding");
  redirect("/onboarding?ok=" + encodeURIComponent("Saved"));
}

export async function updateOnboarding(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageOnboarding) throw new Error("Not allowed");
  const id = String(formData.get("id"));
  const data: Record<string, any> = {
    notes: String(formData.get("notes") || "") || null,
  };
  for (const f of FLAGS) {
    data[f] = formData.get(f) === "on" || formData.get(f) === "true";
  }
  const allDone = FLAGS.every((f) => data[f] === true);
  if (allDone) {
    data.status = "Completed";
    data.completedBy = user.fullName;
    data.completedAt = new Date().toISOString();
  } else {
    data.status = "In Progress";
  }
  await prisma.onboardingChecklist.update({ where: { id }, data });
  revalidatePath("/onboarding");
}
