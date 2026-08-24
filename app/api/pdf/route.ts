import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";
import { buildTemplateVars } from "@/lib/templateMap";
import { drawDynamicTable, INVOICE_COLUMNS } from "@/lib/pdfTables";

export const runtime = "nodejs";

/** Matches Documents & Templates branding (06_Invoice, 04_Proposal, 09_Status) */
const BRAND = {
  name: "LUXAEON SPACES",
  tagline: "an interior company",
  phone: "+2349021144350",
  email: "luxaeonspaces@gmail.com",
  location: "Lagos, Nigeria",
  social: "Instagram/Tiktok- luxaeon_spaces",
  founder: "Oluwabukunmi OMISORE",
  founderTitle: "Founder / Principal Designer",
};

const BURGUNDY = rgb(0.36, 0.1, 0.11);
const GOLD = rgb(0.79, 0.66, 0.43);
const DARK = rgb(0.12, 0.12, 0.12);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT = rgb(0.96, 0.94, 0.9);

function money(n: number) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`;
}

function longDate(d = new Date()) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

type DrawCtx = {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
};

function makeDrawer(ctx: DrawCtx) {
  const draw = (
    text: string,
    opts?: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb>; x?: number; maxWidth?: number }
  ) => {
    const size = opts?.size ?? 10;
    const f = opts?.bold ? ctx.bold : ctx.font;
    const x = opts?.x ?? 50;
    const maxWidth = opts?.maxWidth ?? 495;
    const color = opts?.color ?? DARK;
    const words = String(text || "").split(/\s+/);
    let line = "";
    const lines: string[] = [];
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    for (const ln of lines) {
      if (ctx.y < 60) break;
      ctx.page.drawText(ln, { x, y: ctx.y, size, font: f, color });
      ctx.y -= size + 5;
    }
  };

  const gap = (n = 8) => {
    ctx.y -= n;
  };

  const rule = () => {
    ctx.page.drawLine({
      start: { x: 50, y: ctx.y },
      end: { x: 545, y: ctx.y },
      thickness: 1.2,
      color: GOLD,
    });
    ctx.y -= 14;
  };

  const section = (title: string) => {
    gap(6);
    draw(title, { bold: true, size: 11, color: BURGUNDY });
    gap(2);
  };

  return { draw, gap, rule, section };
}

async function drawHeader(pdf: PDFDocument, ctx: DrawCtx, subtitle?: string) {
  const { draw, gap, rule } = makeDrawer(ctx);

  // Logo
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBytes = await readFile(logoPath);
    const logo = await pdf.embedPng(logoBytes);
    const scale = 36 / logo.height;
    ctx.page.drawImage(logo, {
      x: 50,
      y: ctx.y - 8,
      width: logo.width * scale,
      height: 36,
    });
  } catch {
    /* no logo */
  }

  draw(BRAND.name, { bold: true, size: 16, color: BURGUNDY, x: 100 });
  draw(BRAND.tagline, { size: 9, color: GRAY, x: 100 });
  draw(`${BRAND.phone}  •  ${BRAND.email}`, { size: 8, color: GRAY, x: 100 });
  draw(`${BRAND.location}  •  ${BRAND.social}`, { size: 8, color: GRAY, x: 100 });
  gap(4);
  rule();
  if (subtitle) {
    draw(subtitle, { bold: true, size: 13, color: BURGUNDY });
    gap(4);
  }
}

function drawFooter(ctx: DrawCtx) {
  const { draw, gap } = makeDrawer(ctx);
  gap(16);
  draw("Warm regards,", { size: 10 });
  draw(BRAND.founder, { bold: true, size: 10, color: BURGUNDY });
  draw(`${BRAND.founderTitle}  •  Luxaeon Spaces`, { size: 9, color: GRAY });
  draw(`${BRAND.phone}  •  ${BRAND.email}  •  ${BRAND.social}`, { size: 8, color: GRAY });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const type = body.type as string; // invoice | proposal | summary
    const projectCode = body.projectCode as string | undefined;

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const ctx: DrawCtx = { page, font, bold, y: 800 };
    const { draw, gap, rule, section } = makeDrawer(ctx);

    if (type === "invoice") {
      // Layout mirrors public/templates/06_Invoice_Template.docx
      await drawHeader(pdf, ctx, "INVOICE");

      const project = projectCode
        ? await prisma.project.findUnique({ where: { projectCode } })
        : null;
      const client = body.clientName || project?.clientName || "Client";
      const amount = Number(body.amount ?? project?.designFee ?? 0);
      const paid = Number(body.amountPaid ?? project?.amountPaid ?? 0);
      const due = Math.max(0, amount - paid);
      const invNo = body.invoiceNo || `INV-${projectCode || Date.now()}`;
      const dueDate = body.dueDate || longDate(new Date(Date.now() + 14 * 86400000));

      draw(`Invoice No: ${invNo}`);
      draw(`Date: ${longDate()}`);
      draw(`Due Date: ${dueDate}`);
      gap(6);

      section("BILL TO");
      draw(client, { bold: true, size: 11 });
      if (project?.location) draw(project.location);
      if (projectCode) draw(`Project: ${project?.projectName || projectCode}`);
      gap(8);

      const phase = body.phase || project?.stage || "Design services";
      const lineItems = Array.isArray(body.lineItems) && body.lineItems.length
        ? body.lineItems
        : [{ description: `Interior Design Professional Fee – ${phase}`, qty: 1, unitPrice: amount, amount }];

      const vars = buildTemplateVars({
        projectCode,
        clientName: client,
        designFee: amount,
        amountPaid: paid,
        phase,
        lineItems,
      });

      ctx.y = drawDynamicTable(page, {
        x: 50,
        y: ctx.y,
        width: 495,
        columns: INVOICE_COLUMNS,
        rows: (vars.items as any[]).map((i) => ({
          description: i.description,
          qty: i.qty,
          unitPrice: i.unit_price,
          amount: i.amount,
        })),
        font,
        bold: bold,
      });
      gap(8);

      draw(`Subtotal                                      ${money(amount)}`, { bold: true });
      draw(`Previous Payments Received                   ${money(paid)}`);
      draw(`Amount Due This Invoice                     ${money(due)}`, {
        bold: true,
        size: 11,
        color: BURGUNDY,
      });
      gap(12);

      section("PAYMENT DETAILS");
      draw("Bank Name: [Your Bank]");
      draw(`Account Name: Luxaeon Spaces / ${BRAND.founder}`);
      draw("Account Number: [XXXXXXXXXX]");
      draw("Please use Invoice Number as payment reference.", { size: 9, color: GRAY });
      gap(10);
      draw("Thank you for your business. We appreciate your trust in Luxaeon Spaces.", {
        size: 9,
      });
      draw(`Questions? Contact us at ${BRAND.email} or ${BRAND.phone}`, { size: 9, color: GRAY });
      drawFooter(ctx);
    } else if (type === "proposal") {
      // Layout mirrors public/templates/04_Project_Proposal.docx
      await drawHeader(pdf, ctx, "PROJECT PROPOSAL");

      const project = projectCode
        ? await prisma.project.findUnique({ where: { projectCode } })
        : null;
      if (!project && projectCode) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      const client = body.clientName || project?.clientName || "Client";
      const pname = project?.projectName || project?.location || projectCode || "Project";
      const fee = Number(body.amount ?? project?.designFee ?? 0);

      draw(`Prepared exclusively for ${client}`, { bold: true, size: 11 });
      draw(String(pname), { size: 10, color: GRAY });
      draw(`Date: ${longDate()}  •  Valid for 14 days`, { size: 9, color: GRAY });
      if (projectCode) draw(`Reference: ${projectCode}`, { size: 9, color: GRAY });
      gap(6);

      section("1. Project Understanding");
      draw(
        body.understanding ||
          project?.notes ||
          `Based on our discovery conversation, Luxaeon Spaces will deliver interior design services for ${client}${
            project?.location ? ` at ${project.location}` : ""
          }. This proposal outlines scope, process, timeline and investment.`
      );

      section("2. Scope of Work");
      draw("Luxaeon Spaces will provide the following services:");
      const scope = [
        "Detailed Design Brief review and site assessment / measurements",
        "Concept development (moodboards / style direction)",
        "Space planning and layout options",
        "Detailed design: furniture, finishes, lighting, colour and material selections",
        "3D visualisations of key areas (where included)",
        "Full specification package and schedules",
        "Procurement support and vendor coordination",
        "Installation coordination and site supervision support",
        "Final styling and project handover",
      ];
      scope.forEach((s) => draw(`• ${s}`, { size: 9 }));
      gap(4);
      draw("Exclusions (not included unless specifically agreed):", { bold: true, size: 9 });
      draw("• Structural or architectural works · Major MEP redesign · Furniture/materials purchase (quoted separately)", {
        size: 8,
        color: GRAY,
      });

      section("3. Proposed Process & Timeline");
      draw(
        `Estimated overall timeline: subject to timely client feedback and material lead times. Current stage: ${
          project?.stage || "Onboarding"
        }.`
      );
      [
        "Onboarding & Kick-off — 1 week",
        "Concept Design — 1–2 weeks",
        "Detailed Design — 2–3 weeks",
        "Procurement — Ongoing",
        "Installation — As scheduled",
        "Handover — 1 week",
      ].forEach((s) => draw(`• ${s}`, { size: 9 }));

      section("4. Investment");
      draw(`Total Professional Fee: ${money(fee)}`, { bold: true, size: 12, color: BURGUNDY });
      draw("This fee covers all design services listed in the Scope of Work.", { size: 9 });
      gap(4);
      draw("Payment Schedule", { bold: true });
      draw(`• 50% — Upon signing of Agreement (to commence work)  ≈ ${money(fee * 0.5)}`, {
        size: 9,
      });
      draw(`• 30% — Upon approval of Detailed Design  ≈ ${money(fee * 0.3)}`, { size: 9 });
      draw(`• 20% — Upon project completion / before final handover  ≈ ${money(fee * 0.2)}`, {
        size: 9,
      });
      draw(
        "Note: Furniture, finishes, labour and third-party costs are separate and will be quoted for client approval.",
        { size: 8, color: GRAY }
      );
      drawFooter(ctx);
    } else if (type === "summary") {
      // Combines project detail + status-update template (09) style
      await drawHeader(pdf, ctx, "PROJECT DETAILS & STATUS");

      if (!projectCode) {
        return NextResponse.json({ error: "projectCode required" }, { status: 400 });
      }
      const project = await prisma.project.findUnique({ where: { projectCode } });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      const notes = await prisma.projectNote.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "desc" },
        take: 12,
      });
      const files = await prisma.projectFile.findMany({ where: { projectCode }, take: 15 });
      const cdocs = await prisma.clientDocument.findMany({ where: { projectCode }, take: 15 });
      const balance = Math.max(0, (project.designFee || 0) - (project.amountPaid || 0));

      draw(`Client: ${project.clientName}  |  Project: ${project.projectName || project.projectCode}`, {
        bold: true,
        size: 10,
      });
      draw(`Date: ${longDate()}  |  Code: ${project.projectCode}`, { size: 9, color: GRAY });
      gap(6);

      section("Current Phase");
      draw(`We are currently in: ${project.stage}`, { bold: true, size: 11 });
      draw(`Status: ${project.status}`);
      if (project.location) draw(`Location: ${project.location}`);
      if (project.targetHandover) draw(`Target handover: ${project.targetHandover}`);
      draw(`Sales owner: ${project.salesPersonName || "—"}`);
      draw(`Created by: ${project.createdBy || "—"}`);

      section("Financial Summary");
      draw(`Design fee: ${money(project.designFee)}`);
      draw(`Amount paid: ${money(project.amountPaid)}`);
      draw(`Balance: ${money(balance)}`, { bold: true, color: BURGUNDY });
      if (project.clientAccessCode) {
        draw(`Client portal access code: ${project.clientAccessCode}`, { size: 9, color: GRAY });
      }

      section("Progress This Period");
      if (project.notes) draw(project.notes);
      else draw("See internal notes and stage above.");
      if (notes.length) {
        gap(4);
        draw("Internal notes", { bold: true, size: 9 });
        notes.slice(0, 8).forEach((n) =>
          draw(`• ${n.createdAt.toISOString().slice(0, 10)} — ${n.note.slice(0, 120)}`, { size: 8 })
        );
      }

      section("Files on record");
      const allFiles = [...files, ...cdocs];
      if (allFiles.length === 0) draw("No files uploaded yet.", { size: 9, color: GRAY });
      else
        allFiles
          .slice(0, 12)
          .forEach((f: any) => draw(`• ${f.originalName || f.filename}`, { size: 8 }));

      section("Next Steps");
      draw("Items requiring client input / approval will be communicated separately.");
      draw("Please reply with any questions or decisions needed.", { size: 9, color: GRAY });
      drawFooter(ctx);

    } else if (type === "status" || type === "changeorder" || type === "handover" || type === "agreement") {
      // Auto-fill from Documents & Templates (09, 08, 10, 05)
      if (!projectCode) {
        return NextResponse.json({ error: "projectCode required" }, { status: 400 });
      }
      const project = await prisma.project.findUnique({ where: { projectCode } });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      const titles: Record<string, string> = {
        status: "PROJECT STATUS UPDATE",
        changeorder: "CHANGE ORDER / VARIATION",
        handover: "HANDOVER PACKAGE SUMMARY",
        agreement: "SERVICE AGREEMENT SUMMARY",
      };
      await drawHeader(pdf, ctx, titles[type]);
      draw(`Client: ${project.clientName}`, { bold: true });
      draw(`Project: ${project.projectName || project.projectCode}`);
      draw(`Code: ${project.projectCode}  |  Date: ${longDate()}`, { size: 9, color: GRAY });
      if (project.location) draw(`Location: ${project.location}`);
      gap(6);

      if (type === "status") {
        section("Current Phase");
        draw(`We are currently in: ${project.stage}`, { bold: true, size: 11 });
        draw(`Status: ${project.status}`);
        section("Progress This Period");
        draw(project.notes || "Updates will be listed as work progresses.");
        section("Next Steps");
        draw("Items requiring your input / approval will be confirmed separately.");
        section("Timeline Notes");
        draw(project.targetHandover ? `Target handover: ${project.targetHandover}` : "No change to expected dates unless advised.");
      } else if (type === "changeorder") {
        section("Variation Details");
        draw("This change order records a proposed adjustment to the agreed scope.");
        draw(`Current stage: ${project.stage}`);
        draw(`Current design fee: ${money(project.designFee)}`);
        draw(`Amount paid to date: ${money(project.amountPaid)}`);
        section("Description of Change");
        draw(body.description || project.notes || "[Describe the variation / additional work]");
        section("Cost Impact");
        draw(`Additional fee (if any): ${money(Number(body.amount || 0))}`);
        draw("Client approval is required before work under this change order proceeds.", { size: 9, color: GRAY });
      } else if (type === "handover") {
        section("Handover Checklist Summary");
        [
          "Final design package delivered",
          "Specification / schedules shared",
          "Site completion reviewed",
          "Snag list addressed (where applicable)",
          "Care & maintenance guidance provided",
          "Client walkthrough completed",
        ].forEach((s) => draw(`☐  ${s}`, { size: 10 }));
        section("Project Financial Close");
        draw(`Design fee: ${money(project.designFee)}`);
        draw(`Amount paid: ${money(project.amountPaid)}`);
        draw(`Balance: ${money(Math.max(0, project.designFee - project.amountPaid))}`, { bold: true });
        section("Access");
        if (project.clientAccessCode) draw(`Client portal code: ${project.clientAccessCode}`);
      } else if (type === "agreement") {
        section("Parties");
        draw(`Service provider: Luxaeon Spaces (${BRAND.founder})`);
        draw(`Client: ${project.clientName}`);
        section("Project");
        draw(`Code: ${project.projectCode}`);
        draw(`Name / location: ${project.projectName || project.location || "—"}`);
        section("Professional Fee");
        draw(`Total: ${money(project.designFee)}`, { bold: true, color: BURGUNDY });
        draw("Payment schedule as per proposal (50% / 30% / 20%) unless otherwise agreed in writing.", {
          size: 9,
        });
        section("Scope (summary)");
        draw(
          "Interior design services including concept, detailed design, specifications, and coordination support as outlined in the project proposal."
        );
        draw("This PDF is a summary generated from live project data. The signed Word agreement remains the formal contract where executed.", {
          size: 8,
          color: GRAY,
        });
      }
      drawFooter(ctx);

    } else {
      return NextResponse.json(
        { error: "type must be invoice | proposal | summary | status | changeorder | handover | agreement" },
        { status: 400 }
      );
    }

    const bytes = await pdf.save();
    const filenameMap: Record<string, string> = {
      invoice: `Luxaeon_Invoice_${projectCode || "draft"}.pdf`,
      proposal: `Luxaeon_Proposal_${projectCode || "draft"}.pdf`,
      summary: `Luxaeon_Project_Details_${projectCode}.pdf`,
      status: `Luxaeon_Status_Update_${projectCode}.pdf`,
      changeorder: `Luxaeon_Change_Order_${projectCode}.pdf`,
      handover: `Luxaeon_Handover_${projectCode}.pdf`,
      agreement: `Luxaeon_Agreement_Summary_${projectCode}.pdf`,
    };
    const filename = filenameMap[type] || `Luxaeon_${type}_${projectCode || "doc"}.pdf`;

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "PDF failed" }, { status: 500 });
  }
}
