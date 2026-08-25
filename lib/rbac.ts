export type SessionUser = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  department?: string | null;
};

export function getPerms(user: SessionUser) {
  const role = user.role;
  const dept = (user.department || "").trim();

  const isFounder = role === "Founder";
  const isHod = role === "Department Head";
  const isStaff = role === "Staff";

  const isFinance = ["Finance", "Executive"].includes(dept);
  const isSales = ["Sales & Marketing", "Sales", "Marketing"].includes(dept);
  const isIt = ["IT", "Information Technology"].includes(dept);
  const isHr = ["HR", "Human Resources"].includes(dept);
  const isDesign = dept === "Design";
  const isProcurement = ["Procurement"].includes(dept);

  const isHeadOfIt = isHod && isIt;
  const isHeadOfFinance = isHod && isFinance;
  const isHeadOfProcurement = isHod && isProcurement;
  const isHeadOfSales = isHod && isSales;
  const isHeadOfHr = isHod && isHr;

  return {
    isFounder,
    isHod,
    isStaff,
    isFinance,
    isSales,
    isIt,
    isHr,
    isDesign,
    isProcurement,
    isHeadOfIt,
    isHeadOfFinance,
    isHeadOfProcurement,
    isHeadOfSales,
    isHeadOfHr,

    // All finance staff can view finance (not only HOD)
    canSeeFinance: isFounder || isFinance,
    canSeeFees: isFounder || isFinance,
    canDisburseFunds: isHeadOfFinance, // Founder approves only; Head of Finance disburses

    canRequestOutflow: true,
    canDeptApprove: isFounder || isHod || isHeadOfIt,
    canFinalApprove: isFounder,

    canManageUsers: isFounder || isIt,
    canManageHr: isFounder || isHr || isHeadOfIt,
    canViewHr: isFounder || isHr || isHeadOfIt,
    canSeeAudit: isFounder || isHeadOfIt,
    canSeeReports: isFounder || isHod || isIt,
    canSeeAllActivity: isFounder,

    canCreateProjects: isFounder || isHod || isIt || isDesign,

    canManageSalesTargets: isFounder || isSales,
    canSetSalesTargets: isFounder || isHeadOfSales,

    canManageAppraisals: isFounder || isHr || isHeadOfIt,
    canHodApproveAppraisal: isFounder || isHod,

    canProcessProcurement: isFounder || isProcurement,
    canRequestProcurement: true,

    canManageOnboarding: isFounder || isHr || isHeadOfIt,
  };
}

export const DEPARTMENTS = [
  "Operations",
  "Sales & Marketing",
  "Finance",
  "Design",
  "IT",
  "HR",
  "Procurement",
  "General",
  "Executive",
] as const;

export const PROJECT_STAGES = [
  "Lead",
  "Proposal Sent",
  "Onboarding",
  "Concept Design",
  "Detailed Design",
  "Procurement",
  "Installation",
  "Handover",
  "Completed",
] as const;

export const ONBOARDING_STEPS = [
  { key: "offerLetter", label: "Offer letter issued" },
  { key: "contractSigned", label: "Contract signed" },
  { key: "idCollected", label: "ID / documents collected" },
  { key: "bankDetails", label: "Bank details captured" },
  { key: "systemAccess", label: "System access created" },
  { key: "orientation", label: "Orientation completed" },
  { key: "toolsIssued", label: "Tools / equipment issued" },
  { key: "policyAcknowledged", label: "Policies acknowledged" },
  { key: "mentorAssigned", label: "Mentor / buddy assigned" },
] as const;
