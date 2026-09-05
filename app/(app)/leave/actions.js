"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_DAYS = 60;

function daysBetween(start, end) {
  const a = new Date(start);
  const b = new Date(end);

  const diff =
    Math.ceil(
      (b.getTime() - a.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return Math.max(0, diff);
}

function getReturnPath(formData) {
  const returnTo = String(
    formData.get("returnTo") || "/leaves"
  );

  return returnTo.startsWith("/")
    ? returnTo.split("?")[0]
    : "/leaves";
}

export async function requestLeave(formData) {
  const { user } = await requireUser();

  const startDate = String(
    formData.get("startDate") || ""
  );

  const endDate = String(
    formData.get("endDate") || ""
  );

  const reason =
    String(formData.get("reason") || "") || null;

  if (!startDate || !endDate) {
    const base = getReturnPath(formData);

    redirect(
      base +
        "?error=" +
        encodeURIComponent(
          "Start and end dates required"
        )
    );
  }

  const days = daysBetween(
    startDate,
    endDate
  );

  if (days <= 0) {
    const base = getReturnPath(formData);

    redirect(
      base +
        "?error=" +
        encodeURIComponent(
          "End date must be on or after the start date"
        )
    );
  }

  const year = new Date(startDate).getFullYear();

  const used = await prisma.leaveRequest.aggregate({
    where: {
      userId: user.id,
      year,
      status: {
        in: [
          "Approved",
          "Pending HOD",
          "Pending HR",
        ],
      },
    },
    _sum: {
      days: true,
    },
  });

  const usedDays = used._sum.days || 0;

  if (usedDays + days > MAX_DAYS) {
    const base = getReturnPath(formData);

    redirect(
      base +
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

  revalidatePath("/leaves");
  revalidatePath("/profile");
  revalidatePath("/hr");

  const base = getReturnPath(formData);

  redirect(
    base +
      "?ok=" +
      encodeURIComponent(
        `Leave requested (${days} days) — awaiting your HOD`
      )
  );
}

export async function hodApproveLeave(formData) {
  const { user, perms } = await requireUser();

  if (!perms.isFounder && !perms.isHod) {
    throw new Error("HOD only");
  }

  const id = String(formData.get("id") || "");

  const decision = String(
    formData.get("decision") || "approve"
  );

  const note = String(
    formData.get("note") || ""
  );

  if (!id) {
    throw new Error("Leave request ID required");
  }

  const row = await prisma.leaveRequest.findUnique({
    where: {
      id,
    },
  });

  if (!row || row.status !== "Pending HOD") {
    return;
  }

  if (
    !perms.isFounder &&
    row.department &&
    user.department &&
    row.department !== user.department
  ) {
    throw new Error(
      "Only maker's HOD can approve"
    );
  }

  await prisma.leaveRequest.update({
    where: {
      id,
    },
    data: {
      status:
        decision === "approve"
          ? "Pending HR"
          : "Rejected",

      hodApprovedBy: user.fullName,
      hodNote: note || null,
      hodDate: new Date().toISOString(),
    },
  });

  revalidatePath("/leaves");
  revalidatePath("/hr");
}

export async function hrApproveLeave(formData) {
  const { user, perms } = await requireUser();

  if (!perms.canManageHr && !perms.isFounder) {
    throw new Error("HR only");
  }

  const id = String(formData.get("id") || "");

  const decision = String(
    formData.get("decision") || "approve"
  );

  const note = String(
    formData.get("note") || ""
  );

  if (!id) {
    throw new Error("Leave request ID required");
  }

  const row = await prisma.leaveRequest.findUnique({
    where: {
      id,
    },
  });

  if (!row || row.status !== "Pending HR") {
    return;
  }

  await prisma.leaveRequest.update({
    where: {
      id,
    },
    data: {
      status:
        decision === "approve"
          ? "Approved"
          : "Rejected",

      hrApprovedBy: user.fullName,
      hrNote: note || null,
      hrDate: new Date().toISOString(),
    },
  });

  revalidatePath("/leaves");
  revalidatePath("/hr");
  revalidatePath("/profile");
}