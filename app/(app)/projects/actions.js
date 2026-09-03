"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logWork } from "@/lib/activity";
import { createTransaction } from "@/lib/txn";
import { getYear, format } from "date-fns";

function codeFromCount(n) {
  const year = getYear(new Date());
  return `LX-${year}-${String(n + 1).padStart(3, "0")}`;
}

function accessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function createProject(formData) {
  const { user, perms } = await requireUser();
  if (!perms.canCreateProjects) throw new Error("Not allowed to create projects");

  const clientName = String(formData.get("clientName") || "").trim();
  if (!clientName) throw new Error("Client name required");

  // Match salesperson from form or from lead with same client name
  let salesPersonId = String(formData.get("salesPersonId") || "") || null;
  let salesPersonName = String(formData.get("salesPersonName") || "") || null;
  if (!salesPersonId) {
    const lead = await prisma.lead.findFirst({
      where: { fullName: clientName, ownerUserId: { not: null } },
      orderBy: { createdAt: "desc" },
    });
    if (lead?.ownerUserId) {
      salesPersonId = lead.ownerUserId;
      salesPersonName = lead.ownerName;
    }
  } else {
    const sp = await prisma.user.findUnique({ where: { id: salesPersonId } });
    salesPersonName = sp?.fullName || salesPersonName;
  }

  const count = await prisma.project.count();
  const projectCode = codeFromCount(count);
  const clientAccessCode = accessCode();
  const designFee = Number(String(formData.get("designFee") || "0").replace(/,/g, ""));
  const amountPaid = Number(String(formData.get("amountPaid") || "0").replace(/,/g, ""));

  await prisma.project.create({
    data: {
      projectCode,
      clientName,
      projectName: String(formData.get("projectName") || "") || null,
      location: String(formData.get("location") || "") || null,
      stage: String(formData.get("stage") || "Lead"),
      designFee,
      amountPaid,
      notes: String(formData.get("notes") || "") || null,
      clientAccessCode,
      createdBy: user.fullName,
      salesPersonId,
      salesPersonName,
      status: "Active",
    },
  });

  if (amountPaid > 0) {
    await createTransaction({
      type: "Income",
      category: "Design Fee",
      description: `Payment for ${projectCode} · ${clientName}`,
      amount: amountPaid,
      projectCode,
      salesPersonId,
      salesPersonName,
      clientName,
      createdBy: user.fullName,
    });
    // Progress sales target for that marketer (no separate duplicate manual needed)
    if (salesPersonId) {
      const month = format(new Date(), "MMMM yyyy");
      const target = await prisma.salesTarget.findFirst({
        where: { userId: salesPersonId },
        orderBy: { createdAt: "desc" },
      });
      if (target) {
        await prisma.salesTarget.update({
          where: { id: target.id },
          data: { achievedAmount: (target.achievedAmount || 0) + amountPaid },
        });
      }
    }
  }

  await logWork(user, "Project Created", {
    entityType: "project",
    entityId: projectCode,
    details: `${clientName}${salesPersonName ? ` · Sales: ${salesPersonName}` : ""}`,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/finance");
  revalidatePath("/sales-targets");
  redirect(
    `/projects/${projectCode}?ok=` +
      encodeURIComponent(`Project ${projectCode} created. Upload documents below. Access code: ${clientAccessCode}`)
  );
}

export async function updateProjectStage(formData) {
  const { perms } = await requireUser();
  if (!perms.canCreateProjects && !perms.isHod && !perms.isFounder) throw new Error("Not allowed");

  const code = String(formData.get("projectCode") || "");
  const stage = String(formData.get("stage") || "");
  await prisma.project.update({ where: { projectCode: code }, data: { stage } });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}