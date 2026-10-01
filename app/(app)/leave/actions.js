"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { LEAVE_TYPES } from "./components/leave-types";
import {
  revalidatePath,
  revalidateTag,
} from "next/cache";
import { redirect } from "next/navigation";

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
    formData.get("returnTo") || "/leave"
  );

  return returnTo.startsWith("/")
    ? returnTo.split("?")[0]
    : "/leave";
}

function redirectWithError(formData, message) {
  const base = getReturnPath(formData);

  redirect(
    base +
      "?error=" +
      encodeURIComponent(message)
  );
}

export async function requestLeave(formData) {
  const { user } = await requireUser();

  const startDate = String(
    formData.get("startDate") || ""
  );

  const endDate = String(
    formData.get("endDate") || ""
  );

  const leaveType = String(
    formData.get("leaveType") || ""
  );

  const documentFilename =
    String(
      formData.get("documentFilename") || ""
    ) || null;

  const documentName =
    String(
      formData.get("documentName") || ""
    ) || null;

  const reason =
    String(formData.get("reason") || "") || null;

  if (!startDate || !endDate) {
    redirectWithError(
      formData,
      "Start and end dates are required."
    );
  }

  if (
    !leaveType ||
    !LEAVE_TYPES[leaveType]
  ) {
    redirectWithError(
      formData,
      "Please select a valid leave type."
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    redirectWithError(
      formData,
      "Please provide valid leave dates."
    );
  }

  if (end < start) {
    redirectWithError(
      formData,
      "End date must be on or after the start date."
    );
  }

  if (
    start.getFullYear() !==
    end.getFullYear()
  ) {
    redirectWithError(
      formData,
      "Leave requests cannot cross calendar years. Please submit separate requests for each year."
    );
  }

  const days = daysBetween(
    startDate,
    endDate
  );

  if (days <= 0) {
    redirectWithError(
      formData,
      "The selected dates are invalid."
    );
  }

  const type = LEAVE_TYPES[leaveType];
  const year = start.getFullYear();

  if (
    type.requiresDocument &&
    (!documentFilename || !documentName)
  ) {
    redirectWithError(
      formData,
      `${type.label} requires a supporting document.`
    );
  }

  const used =
    await prisma.leaveRequest.aggregate({
      where: {
        userId: user.id,
        leaveType,
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

  const remaining =
    type.maxDays - usedDays;

  if (days > remaining) {
    redirectWithError(
      formData,
      `${type.label} allows ${type.maxDays} days per year. You have ${remaining} day${
        remaining === 1 ? "" : "s"
      } remaining for ${year}. This request is ${days} days.`
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
      leaveType,
      documentFilename,
      documentName,
      status: "Pending HOD",
      year,
    },
  });

  revalidateTag("leave");
  revalidatePath("/leave");
  revalidatePath("/profile");
  revalidatePath("/hr");

  const base = getReturnPath(formData);

  redirect(
    base +
      "?ok=" +
      encodeURIComponent(
        `${type.label} requested (${days} day${
          days === 1 ? "" : "s"
        }) — awaiting your HOD.`
      )
  );
}

export async function hodApproveLeave(formData) {
  const { user, perms } =
    await requireUser();

  if (!perms.isFounder && !perms.isHod) {
    throw new Error("HOD only");
  }

  const id = String(
    formData.get("id") || ""
  );

  const decision = String(
    formData.get("decision") || "approve"
  );

  const note = String(
    formData.get("note") || ""
  );

  if (!id) {
    throw new Error(
      "Leave request ID required"
    );
  }

  const row =
    await prisma.leaveRequest.findUnique({
      where: {
        id,
      },
    });

  if (
    !row ||
    row.status !== "Pending HOD"
  ) {
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
      hodDate:
        new Date().toISOString(),
    },
  });

  revalidateTag("leave");
  revalidatePath("/leave");
  revalidatePath("/hr");
}

export async function hrApproveLeave(formData) {
  const { user, perms } =
    await requireUser();

  if (
    !perms.canManageHr &&
    !perms.isFounder
  ) {
    throw new Error("HR only");
  }

  const id = String(
    formData.get("id") || ""
  );

  const decision = String(
    formData.get("decision") || "approve"
  );

  const note = String(
    formData.get("note") || ""
  );

  if (!id) {
    throw new Error(
      "Leave request ID required"
    );
  }

  const row =
    await prisma.leaveRequest.findUnique({
      where: {
        id,
      },
    });

  if (
    !row ||
    row.status !== "Pending HR"
  ) {
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
      hrDate:
        new Date().toISOString(),
    },
  });

  revalidateTag("leave");
  revalidatePath("/leave");
  revalidatePath("/hr");
  revalidatePath("/profile");
}