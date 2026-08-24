-- Luxaeon Business OS initial PostgreSQL schema
-- Run this file in Supabase SQL Editor.

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "jobTitle" TEXT,
    "dateJoined" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "salaryAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "nationality" TEXT,
    "stateOfOrigin" TEXT,
    "nin" TEXT,
    "nokName" TEXT,
    "nokRelationship" TEXT,
    "nokPhone" TEXT,
    "nokEmail" TEXT,
    "nokAddress" TEXT,
    "spouseName" TEXT,
    "spousePhone" TEXT,
    "spouseEmail" TEXT,
    "spouseOccupation" TEXT,
    "guarantorName" TEXT,
    "guarantorPhone" TEXT,
    "guarantorEmail" TEXT,
    "guarantorAddress" TEXT,
    "guarantorOccupation" TEXT,
    "guarantorRelationship" TEXT,
    "healthStatus" TEXT,
    "healthHistory" TEXT,
    "bloodGroup" TEXT,
    "allergies" TEXT,
    "disabilities" TEXT,
    "workExperience" TEXT,
    "skills" TEXT,
    "educationHistory" TEXT,
    "certifications" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "category" TEXT DEFAULT 'General',
    "description" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "projectType" TEXT,
    "budgetRange" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "nextFollowup" TEXT,
    "ownerUserId" TEXT,
    "ownerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "projectName" TEXT,
    "location" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'Lead',
    "startDate" TEXT,
    "targetHandover" TEXT,
    "designFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "clientAccessCode" TEXT,
    "createdBy" TEXT,
    "salesPersonId" TEXT,
    "salesPersonName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectNote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectFile" (
    "id" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "uploadedBy" TEXT,
    "category" TEXT DEFAULT 'General',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientDocument" (
    "id" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "uploadedBy" TEXT,
    "uploadedByRole" TEXT DEFAULT 'staff',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "reliability" INTEGER NOT NULL DEFAULT 3,
    "quality" INTEGER NOT NULL DEFAULT 3,
    "priceLevel" TEXT,
    "notes" TEXT,
    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "txnId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "projectCode" TEXT,
    "salesPersonId" TEXT,
    "salesPersonName" TEXT,
    "clientName" TEXT,
    "date" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransactionDocument" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "category" TEXT DEFAULT 'Invoice',
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransactionAudit" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT,
    "txnId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedBy" TEXT,
    "performedById" TEXT,
    "role" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutflowRequest" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedById" TEXT,
    "department" TEXT,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "vendor" TEXT,
    "projectCode" TEXT,
    "payeeName" TEXT,
    "payeeBankName" TEXT,
    "payeeAccountNo" TEXT,
    "payeeAccountName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending Department',
    "deptApprovedBy" TEXT,
    "deptNote" TEXT,
    "deptDate" TEXT,
    "finalApprovedBy" TEXT,
    "finalNote" TEXT,
    "finalDate" TEXT,
    "financeReleasedBy" TEXT,
    "financeNote" TEXT,
    "financeDate" TEXT,
    "linkedTxnId" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutflowRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutflowDocument" (
    "id" TEXT NOT NULL,
    "outflowId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutflowDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollBatch" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "totalNet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "preparedBy" TEXT,
    "founderApprovedBy" TEXT,
    "founderApprovedAt" TEXT,
    "paidBy" TEXT,
    "paidAt" TEXT,
    "linkedTxnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PayrollBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPay" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "preparedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TEXT,
    "paidBy" TEXT,
    "paidAt" TEXT,
    "linkedTxnId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "fullName" TEXT,
    "role" TEXT,
    "department" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "activity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "offerLetter" BOOLEAN NOT NULL DEFAULT false,
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "idCollected" BOOLEAN NOT NULL DEFAULT false,
    "bankDetails" BOOLEAN NOT NULL DEFAULT false,
    "systemAccess" BOOLEAN NOT NULL DEFAULT false,
    "orientation" BOOLEAN NOT NULL DEFAULT false,
    "toolsIssued" BOOLEAN NOT NULL DEFAULT false,
    "policyAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "mentorAssigned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "startedBy" TEXT,
    "completedBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "achievedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leadsTarget" INTEGER NOT NULL DEFAULT 0,
    "leadsAchieved" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "setBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SalesTarget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Appraisal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "department" TEXT,
    "period" TEXT NOT NULL,
    "quarter" TEXT,
    "year" INTEGER,
    "selfQuality" INTEGER NOT NULL DEFAULT 0,
    "selfTeamwork" INTEGER NOT NULL DEFAULT 0,
    "selfReliability" INTEGER NOT NULL DEFAULT 0,
    "selfInitiative" INTEGER NOT NULL DEFAULT 0,
    "selfCommunication" INTEGER NOT NULL DEFAULT 0,
    "selfOverall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "selfKpis" TEXT,
    "selfStrengths" TEXT,
    "selfImprovements" TEXT,
    "selfGoals" TEXT,
    "selfSalesTarget" DOUBLE PRECISION,
    "selfSalesAchieved" DOUBLE PRECISION,
    "selfSubmittedAt" TEXT,
    "hodReviewer" TEXT,
    "hodNote" TEXT,
    "hodApprovedAt" TEXT,
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "teamworkScore" INTEGER NOT NULL DEFAULT 0,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 0,
    "initiativeScore" INTEGER NOT NULL DEFAULT 0,
    "communicationScore" INTEGER NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strengths" TEXT,
    "improvements" TEXT,
    "goals" TEXT,
    "hrNote" TEXT,
    "hrReviewer" TEXT,
    "hrApprovedAt" TEXT,
    "founderNote" TEXT,
    "founderApprover" TEXT,
    "founderApprovedAt" TEXT,
    "employeeComment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Self Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appraisal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProcurementRequest" (
    "id" TEXT NOT NULL,
    "projectCode" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorPreferred" TEXT,
    "payeeName" TEXT,
    "payeeBankName" TEXT,
    "payeeAccountNo" TEXT,
    "payeeAccountName" TEXT,
    "requestedBy" TEXT NOT NULL,
    "requestedById" TEXT,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending Procurement HOD',
    "procurementNote" TEXT,
    "processedBy" TEXT,
    "processedAt" TEXT,
    "hodApprovedBy" TEXT,
    "hodNote" TEXT,
    "hodDate" TEXT,
    "founderApprovedBy" TEXT,
    "founderNote" TEXT,
    "founderDate" TEXT,
    "financeReleasedBy" TEXT,
    "financeNote" TEXT,
    "financeDate" TEXT,
    "linkedTxnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProcurementRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProcurementDocument" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProcurementDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "department" TEXT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending HOD',
    "hodApprovedBy" TEXT,
    "hodNote" TEXT,
    "hodDate" TEXT,
    "hrApprovedBy" TEXT,
    "hrNote" TEXT,
    "hrDate" TEXT,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "fullName" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkActivity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");
CREATE UNIQUE INDEX "Project_projectCode_key" ON "Project"("projectCode");
CREATE UNIQUE INDEX "Transaction_txnId_key" ON "Transaction"("txnId");

ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectNote" ADD CONSTRAINT "ProjectNote_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_projectCode_fkey"
  FOREIGN KEY ("projectCode") REFERENCES "Project"("projectCode") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClientDocument" ADD CONSTRAINT "ClientDocument_projectCode_fkey"
  FOREIGN KEY ("projectCode") REFERENCES "Project"("projectCode") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransactionDocument" ADD CONSTRAINT "TransactionDocument_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OutflowDocument" ADD CONSTRAINT "OutflowDocument_outflowId_fkey"
  FOREIGN KEY ("outflowId") REFERENCES "OutflowRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "PayrollBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProcurementDocument" ADD CONSTRAINT "ProcurementDocument_procurementId_fkey"
  FOREIGN KEY ("procurementId") REFERENCES "ProcurementRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
