import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

function csvEscape(v: any) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const format = (searchParams.get("format") || "csv").toLowerCase();
  const all = searchParams.get("all") === "1";

  const include = { profile: true, hrDocuments: true } as const;

  const employees = all
    ? await prisma.user.findMany({ include, orderBy: { fullName: "asc" } })
    : userId
      ? await prisma.user.findMany({ where: { id: userId }, include })
      : [];

  if (!employees.length) {
    return NextResponse.json({ error: "No employees found" }, { status: 404 });
  }

  if (format === "csv" || format === "excel") {
    const headers = [
      "Full Name", "Username", "Role", "Department", "Active",
      "Employee ID", "Job Title", "Date Joined", "Phone", "Email", "Address",
      "Salary", "Bank", "Account",
      "Date of Birth", "Gender", "Marital Status", "Nationality", "State of Origin", "NIN",
      "NOK Name", "NOK Relationship", "NOK Phone", "NOK Email", "NOK Address",
      "Spouse Name", "Spouse Phone", "Spouse Email", "Spouse Occupation",
      "Guarantor Name", "Guarantor Phone", "Guarantor Email", "Guarantor Address", "Guarantor Occupation", "Guarantor Relationship",
      "Health Status", "Blood Group", "Allergies", "Disabilities", "Health History",
      "Work Experience", "Skills", "Education", "Certifications", "HR Notes",
      "Document Count",
    ];
    const rows = employees.map((e) => {
      const p = e.profile;
      return [
        e.fullName, e.username, e.role, e.department, e.active ? "Yes" : "No",
        p?.employeeId, p?.jobTitle, p?.dateJoined, p?.phone, p?.email, p?.address,
        p?.salaryAmount, p?.bankName, p?.bankAccount,
        p?.dateOfBirth, p?.gender, p?.maritalStatus, p?.nationality, p?.stateOfOrigin, p?.nin,
        p?.nokName, p?.nokRelationship, p?.nokPhone, p?.nokEmail, p?.nokAddress,
        p?.spouseName, p?.spousePhone, p?.spouseEmail, p?.spouseOccupation,
        p?.guarantorName, p?.guarantorPhone, p?.guarantorEmail, p?.guarantorAddress, p?.guarantorOccupation, p?.guarantorRelationship,
        p?.healthStatus, p?.bloodGroup, p?.allergies, p?.disabilities, p?.healthHistory,
        p?.workExperience, p?.skills, p?.educationHistory, p?.certifications, p?.notes,
        e.hrDocuments.length,
      ].map(csvEscape).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const name = all ? "Luxaeon_All_Employees.csv" : `Luxaeon_Employee_${employees[0].fullName.replace(/\s+/g, "_")}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  }

  // PDF — one employee summary (or multi-page if all)
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const burgundy = rgb(0.36, 0.1, 0.11);
  const gray = rgb(0.35, 0.35, 0.35);
  const dark = rgb(0.1, 0.1, 0.1);

  for (const e of employees) {
    const page = pdf.addPage([595, 842]);
    let y = 800;
    const line = (text: string, opts?: { bold?: boolean; size?: number; color?: any }) => {
      const size = opts?.size ?? 10;
      page.drawText((text || "—").slice(0, 95), {
        x: 50,
        y,
        size,
        font: opts?.bold ? fontBold : font,
        color: opts?.color ?? dark,
      });
      y -= size + 5;
      if (y < 50) y = 50;
    };

    line("LUXAEON SPACES — EMPLOYEE FILE", { bold: true, size: 14, color: burgundy });
    line(`${e.fullName} · ${e.role} · ${e.department || ""}`, { size: 11 });
    line(`Username: ${e.username} · Active: ${e.active ? "Yes" : "No"}`, { size: 9, color: gray });
    y -= 6;
    const p = e.profile;
    line("Work", { bold: true, color: burgundy });
    line(`ID: ${p?.employeeId || "—"} · Title: ${p?.jobTitle || "—"} · Joined: ${p?.dateJoined || "—"}`);
    line(`Phone: ${p?.phone || "—"} · Email: ${p?.email || "—"}`);
    line(`Salary: NGN ${(p?.salaryAmount || 0).toLocaleString()} · Bank: ${p?.bankName || "—"} ${p?.bankAccount || ""}`);
    y -= 4;
    line("Personal", { bold: true, color: burgundy });
    line(`DOB: ${p?.dateOfBirth || "—"} · Gender: ${p?.gender || "—"} · Marital: ${p?.maritalStatus || "—"}`);
    line(`Nationality: ${p?.nationality || "—"} · Origin: ${p?.stateOfOrigin || "—"} · NIN: ${p?.nin || "—"}`);
    y -= 4;
    line("Next of kin", { bold: true, color: burgundy });
    line(`${p?.nokName || "—"} (${p?.nokRelationship || "—"}) · ${p?.nokPhone || "—"}`);
    y -= 4;
    line("Spouse", { bold: true, color: burgundy });
    line(`${p?.spouseName || "—"} · ${p?.spousePhone || "—"} · ${p?.spouseOccupation || "—"}`);
    y -= 4;
    line("Guarantor", { bold: true, color: burgundy });
    line(`${p?.guarantorName || "—"} · ${p?.guarantorPhone || "—"} · ${p?.guarantorOccupation || "—"}`);
    y -= 4;
    line("Health", { bold: true, color: burgundy });
    line(`Status: ${p?.healthStatus || "—"} · Blood: ${p?.bloodGroup || "—"} · Allergies: ${p?.allergies || "—"}`);
    if (p?.healthHistory) line(String(p.healthHistory).slice(0, 90), { size: 9, color: gray });
    y -= 4;
    line("Skills / Education", { bold: true, color: burgundy });
    if (p?.skills) line(`Skills: ${String(p.skills).slice(0, 90)}`, { size: 9 });
    if (p?.educationHistory) line(`Education: ${String(p.educationHistory).slice(0, 90)}`, { size: 9 });
    if (p?.certifications) line(`Certs: ${String(p.certifications).slice(0, 90)}`, { size: 9 });
    if (p?.workExperience) line(`Experience: ${String(p.workExperience).slice(0, 90)}`, { size: 9 });
    y -= 6;
    line(`Documents on file: ${e.hrDocuments.length}`, { size: 9, color: gray });
    line(`Generated ${new Date().toLocaleString()} · Luxaeon Spaces HR`, { size: 8, color: gray });
  }

  const bytes = await pdf.save();
  const name = all
    ? "Luxaeon_All_Employees.pdf"
    : `Luxaeon_Employee_${employees[0].fullName.replace(/\s+/g, "_")}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
