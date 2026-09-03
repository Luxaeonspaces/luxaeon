"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

function avg(nums: number[]) {
  const v = nums.filter((n) => n > 0);
  if (!v.length) return 0;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
}

/** Employee: create self-appraisal + KPIs (quarterly) */
export async function submitSelfAppraisal(formData: FormData) {
  const { user } = await requireUser();
  const year = Number(formData.get("year") || new Date().getFullYear());
  const quarter = String(formData.get("quarter") || "Q1");
  const period = `${year}-${quarter}`;

  const selfScores = [
    Number(formData.get("selfQuality") || 0),
    Number(formData.get("selfTeamwork") || 0),
    Number(formData.get("selfReliability") || 0),
    Number(formData.get("selfInitiative") || 0),
    Number(formData.get("selfCommunication") || 0),
  ];

  // Pull latest sales target for this user + period if Sales
  let selfSalesTarget: number | null = null;
  let selfSalesAchieved: number | null = null;
  const target = await prisma.salesTarget.findFirst({
    where: { userId: user.id, period: { contains: quarter } },
    orderBy: { createdAt: "desc" },
  });
  // also try exact period match
  const target2 =
    (await prisma.salesTarget.findFirst({
      where: { userId: user.id, period },
      orderBy: { createdAt: "desc" },
    })) || target;
  if (target2) {
    selfSalesTarget = target2.targetAmount;
    selfSalesAchieved = target2.achievedAmount;
  }
  // allow override from form
  if (formData.get("selfSalesTarget")) selfSalesTarget = Number(formData.get("selfSalesTarget") || 0);
  if (formData.get("selfSalesAchieved")) selfSalesAchieved = Number(formData.get("selfSalesAchieved") || 0);

  await prisma.appraisal.create({
    data: {
      userId: user.id,
      employeeName: user.fullName || "",
      department: user.department || null,
      period,
      quarter,
      year,
      selfQuality: selfScores[0],
      selfTeamwork: selfScores[1],
      selfReliability: selfScores[2],
      selfInitiative: selfScores[3],
      selfCommunication: selfScores[4],
      selfOverall: avg(selfScores),
      selfKpis: String(formData.get("selfKpis") || "") || null,
      selfStrengths: String(formData.get("selfStrengths") || "") || null,
      selfImprovements: String(formData.get("selfImprovements") || "") || null,
      selfGoals: String(formData.get("selfGoals") || "") || null,
      selfSalesTarget,
      selfSalesAchieved,
      selfSubmittedAt: new Date().toISOString(),
      status: "Self Submitted",
    },
  });
  revalidatePath("/appraisals");
  revalidatePath("/dashboard");
}

/** HR: score + approve → Founder */
export async function hrApproveAppraisal(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canManageAppraisals) throw new Error("Not allowed");
  const id = String(formData.get("id"));
  const existing = await prisma.appraisal.findUnique({ where: { id } });
  if (!existing || existing.status !== "HOD Approved") throw new Error("Awaiting HOD approval first");
  const scores = [
    Number(formData.get("qualityScore") || 0),
    Number(formData.get("teamworkScore") || 0),
    Number(formData.get("reliabilityScore") || 0),
    Number(formData.get("initiativeScore") || 0),
    Number(formData.get("communicationScore") || 0),
  ];
  await prisma.appraisal.update({
    where: { id },
    data: {
      qualityScore: scores[0],
      teamworkScore: scores[1],
      reliabilityScore: scores[2],
      initiativeScore: scores[3],
      communicationScore: scores[4],
      overallScore: avg(scores),
      strengths: String(formData.get("strengths") || "") || null,
      improvements: String(formData.get("improvements") || "") || null,
      goals: String(formData.get("goals") || "") || null,
      hrNote: String(formData.get("hrNote") || "") || null,
      hrReviewer: user.fullName,
      hrApprovedAt: new Date().toISOString(),
      status: "HR Approved",
    },
  });
  revalidatePath("/appraisals");
}

/** Founder final approval */
export async function founderApproveAppraisal(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.isFounder) throw new Error("Founder only");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "approve");
  await prisma.appraisal.update({
    where: { id },
    data: {
      founderNote: String(formData.get("founderNote") || "") || null,
      founderApprover: user.fullName,
      founderApprovedAt: new Date().toISOString(),
      status: decision === "reject" ? "Rejected" : "Founder Approved",
    },
  });
  revalidatePath("/appraisals");
}


/** Head of Department approves before HR */
export async function hodApproveAppraisal(formData: FormData) {
  const { user, perms } = await requireUser();
  if (!perms.canHodApproveAppraisal) throw new Error("HOD only");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision") || "approve");
  const note = String(formData.get("note") || "");
  const row = await prisma.appraisal.findUnique({ where: { id } });
  if (!row || row.status !== "Self Submitted") return;
  // HOD should be same department (Founder bypass)
  if (!perms.isFounder && row.department && user.department && row.department !== user.department) {
    throw new Error("Only HOD of employee department can approve");
  }
  await prisma.appraisal.update({
    where: { id },
    data: {
      hodReviewer: user.fullName,
      hodNote: note || null,
      hodApprovedAt: new Date().toISOString(),
      status: decision === "reject" ? "Rejected" : "HOD Approved",
    },
  });
  revalidatePath("/appraisals");
}
