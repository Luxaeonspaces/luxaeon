"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

const PROFILE_FIELDS = [
  "employeeId", "phone", "email", "address", "jobTitle", "dateJoined",
  "bankName", "bankAccount", "notes",
  "dateOfBirth", "gender", "maritalStatus", "nationality", "stateOfOrigin", "nin",
  "nokName", "nokRelationship", "nokPhone", "nokEmail", "nokAddress",
  "spouseName", "spousePhone", "spouseEmail", "spouseOccupation",
  "guarantorName", "guarantorPhone", "guarantorEmail", "guarantorAddress",
  "guarantorOccupation", "guarantorRelationship",
  "healthStatus", "healthHistory", "bloodGroup", "allergies", "disabilities",
  "workExperience", "skills", "educationHistory", "certifications",
] as const;

export async function saveProfile(formData: FormData) {
  const { perms } = await requireUser();
  if (!perms.canManageHr) throw new Error("Not allowed");
  const userId = String(formData.get("userId"));
  if (!userId) return;

  const data: Record<string, any> = {
    salaryAmount: Number(String(formData.get("salaryAmount") || "0").replace(/,/g, "")),
  };
  for (const key of PROFILE_FIELDS) {
    const v = formData.get(key);
    if (v !== null) data[key] = String(v) || null;
  }

  await prisma.staffProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  revalidatePath("/hr");
  revalidatePath(`/hr/${userId}`);
}

export async function preparePayroll(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageHr) throw new Error("Not allowed");
  const period = String(formData.get("period") || "").trim();
  if (!period) return;
  const staff = await prisma.user.findMany({
    where: { active: true },
    include: { profile: true },
  });
  for (const s of staff) {
    const basic = s.profile?.salaryAmount || 0;
    await prisma.payrollRecord.create({
      data: {
        userId: s.id,
        employeeName: s.fullName,
        period,
        basicSalary: basic,
        netPay: basic,
        status: "Draft",
        preparedBy: user.fullName,
      },
    });
  }
  revalidatePath("/hr");
}
