"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_DAYS = 60;

function daysBetween(start: string, end: string) {
  const a = new Date(start);
  const b = new Date(end);
  const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, diff);
}

export async function requestLeave(formData: FormData) {
  const { user } = await requireUser();
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const reason = String(formData.get("reason") || "") || null;
  if (!startDate || !endDate) {
    const returnTo0 = String(formData.get("returnTo") || "/leave");
    const base0 = returnTo0.startsWith("/") ? returnTo0.split("?")[0] : "/leave";
    redirect(base0 + "?error=" + encodeURIComponent("Start and end dates required"));
  }
  const days = daysBetween(startDate, endDate);
  const year = new Date(startDate).getFullYear();

  const used = await prisma.leaveRequest.aggregate({
    where: {
      userId: user.id,
      year,
      status: { in: ["Approved", "Pending HOD", "Pending HR"] },
    },
    _sum: { days: true },
  });
  const usedDays = used._sum.days || 0;
  if (usedDays + days > MAX_DAYS) {
    const returnTo1 = String(formData.get("returnTo") || "/leave");
    const base1 = returnTo1.startsWith("/") ? returnTo1.split("?")[0] : "/leave";
    redirect(
      base1 +
        "?error=" +
        encodeURIComponent(
          `Leave balance exceeded. Used/pending ${usedDays} of ${MAX_DAYS} days. This request is ${days} days.`
        )
    );
  }

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      employeeName: user.fullName,
      department: user.department || null,
      startDate,
      endDate,
      days,
      reason,
      status: "Pending HOD",
      year,
    },
  });
  revalidatePath("/leave");
  revalidatePath("/profile");
  revalidatePath("/hr");
  const returnTo = String(formData.get("returnTo") || "/leave");
  const base = returnTo.startsWith("/") ? returnTo.split("?")[0] : "/leave";
  redirect(base + "?ok=" + encodeURIComponent(`Leave requested (${days} days) — awaiting your HOD`));
}

export async function hodApproveLeave(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isFounder && !perms.isHod) throw new Error("HOD only");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "approve");
  const note = String(formData.get("note") || "");
  const row = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!row || row.status !== "Pending HOD") return;
  if (!perms.isFounder && row.department && user.department && row.department !== user.department) {
    throw new Error("Only maker's HOD can approve");
  }
  await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: decision === "approve" ? "Pending HR" : "Rejected",
      hodApprovedBy: user.fullName,
      hodNote: note || null,
      hodDate: new Date().toISOString(),
    },
  });
  revalidatePath("/leave");
  revalidatePath("/hr");
}

export async function hrApproveLeave(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageHr && !perms.isFounder) throw new Error("HR only");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "approve");
  const note = String(formData.get("note") || "");
  await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: decision === "approve" ? "Approved" : "Rejected",
      hrApprovedBy: user.fullName,
      hrNote: note || null,
      hrDate: new Date().toISOString(),
    },
  });
  revalidatePath("/leave");
  revalidatePath("/hr");
  revalidatePath("/profile");
}
