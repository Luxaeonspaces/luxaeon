"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { logWork } from "@/lib/activity";

const leadStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
  "Nurture",
];

const leadSources = [
  "Instagram",
  "TikTok",
  "Referral",
  "WhatsApp",
  "Website",
  "Other",
];

const salesDepartments = [
  "Sales & Marketing",
  "Sales",
  "Marketing",
];

export async function createLead(formData) {
  const { user } = await requireUser();

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) return;

  const email = String(formData.get("email") || "").trim();
  const normalizedEmail = email ? email.toLowerCase() : null;

  if (normalizedEmail) {
    const existingLead = await prisma.lead.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingLead) {
      redirect(
        "/leads?error=" +
          encodeURIComponent("A lead with this email already exists")
      );
    }
  }

  let ownerUserId = String(formData.get("ownerUserId") || "") || null;

  let ownerName = String(formData.get("ownerName") || "") || null;

  if (
    !ownerUserId &&
    user.department &&
    salesDepartments.includes(user.department)
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
      email: normalizedEmail,
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

  revalidateTag("leads");
  revalidatePath("/leads");
  revalidatePath("/sales-targets");
  revalidatePath("/dashboard");

  redirect(
    "/leads?ok=" + encodeURIComponent("Lead saved")
  );
}

export async function updateLead(formData) {
  const { user, perms } = await requireUser();

  if (!perms.canEditLeads) {
    return { success: false, error: "You do not have permission to edit leads." };
  }

  const leadId = String(formData.get("leadId") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();

  if (!leadId) {
    return { success: false, error: "Lead ID is missing." };
  }

  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }

  const email = String(formData.get("email") || "").trim();
  const normalizedEmail = email ? email.toLowerCase() : null;

  const status = String(formData.get("status") || "");
  const source = String(formData.get("source") || "");

  if (!leadStatuses.includes(status)) {
    return { success: false, error: "Invalid lead status." };
  }

  if (source && !leadSources.includes(source)) {
    return { success: false, error: "Invalid lead source." };
  }

  try {
    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return { success: false, error: "This lead no longer exists." };
    }

    if (normalizedEmail) {
      const duplicateLead = await prisma.lead.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: leadId },
        },
        select: { id: true },
      });

      if (duplicateLead) {
        return {
          success: false,
          error: "Another lead already uses this email address.",
        };
      }
    }

    let ownerUserId = String(formData.get("ownerUserId") || "") || null;
    let ownerName = null;

    if (ownerUserId === existingLead.ownerUserId) {
      // Preserve an existing owner, even if they are no longer active.
      ownerName = existingLead.ownerName;
    } else if (ownerUserId) {
      const owner = await prisma.user.findFirst({
        where: {
          id: ownerUserId,
          active: true,
          department: { in: salesDepartments },
        },
        select: {
          id: true,
          fullName: true,
        },
      });

      if (!owner) {
        return {
          success: false,
          error: "Please select a valid active sales owner.",
        };
      }

      ownerName = owner.fullName;
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        fullName,
        email: normalizedEmail,
        phone: String(formData.get("phone") || "").trim() || null,
        location: String(formData.get("location") || "").trim() || null,
        source: source || null,
        status,
        notes: String(formData.get("notes") || "").trim() || null,
        ownerUserId,
        ownerName,
      },
    });

    await logWork(user, "Lead Updated", {
      entityType: "lead",
      details: `${fullName} · Updated lead information`,
    });

    revalidateTag("leads");
    revalidatePath("/leads");
    revalidatePath("/sales-targets");
    revalidatePath("/dashboard");

    return { success: true, error: "" };
  } catch (error) {
    console.error("Update lead error:", error);

    return {
      success: false,
      error: "Something went wrong while updating this lead.",
    };
  }
}

export async function deleteLead(formData) {
  const { user, perms } = await requireUser();

  if (!perms.canDeleteLeads) {
    return { success: false, error: "You do not have permission to delete leads." };
  }

  const leadId = String(formData.get("leadId") || "").trim();

  if (!leadId) {
    return { success: false, error: "Lead ID is missing." };
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, fullName: true },
    });

    if (!lead) {
      return { success: false, error: "This lead no longer exists." };
    }

    await prisma.lead.delete({ where: { id: leadId } });

    await logWork(user, "Lead Deleted", {
      entityType: "lead",
      entityId: leadId,
      details: `${lead.fullName} · Permanently deleted`,
    });

    revalidateTag("leads");
    revalidatePath("/leads");
    revalidatePath("/sales-targets");
    revalidatePath("/dashboard");

    return { success: true, error: "" };
  } catch (error) {
    console.error("Delete lead error:", error);

    return {
      success: false,
      error: "Something went wrong while deleting this lead.",
    };
  }
}
