import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/excel";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

async function loadHistory(projectCode: string) {
  const project = await prisma.project.findUnique({ where: { projectCode } });
  if (!project) return null;
  const payments = await prisma.transaction.findMany({
    where: { projectCode, type: "Income" },
    orderBy: { createdAt: "asc" },
  });
  const notes = await prisma.projectNote.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "asc" },
  });
  const work = await prisma.workActivity.findMany({
    where: { entityType: "project", entityId: projectCode },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  const balance = Math.max(0, (project.designFee || 0) - (project.amountPaid || 0));
  return { project, payments, notes, work, balance };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const projectCode = url.searchParams.get("projectCode");
  const format = (url.searchParams.get("format") || "csv").toLowerCase();
  if (!projectCode) return NextResponse.json({ error: "projectCode required" }, { status: 400 });

  const data = await loadHistory(projectCode);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { project, payments, notes, work, balance } = data;

  if (format === "csv" || format === "excel") {
    const rows = [
      ["Luxaeon Spaces — Project History"],
      ["Project Code", project.projectCode],
      ["Client", project.clientName],
      ["Stage", project.stage],
      ["Status", project.status],
      ["Design Fee (₦)", project.designFee],
      ["Amount Paid (₦)", project.amountPaid],
      ["Balance (₦)", balance],
      [],
      ["PAYMENT HISTORY"],
      ["Date", "Txn ID", "Description", "Amount (₦)", "Recorded by"],
      ...payments.map((p) => [
        p.date || p.createdAt.toISOString().slice(0, 10),
        p.txnId,
        p.description || "",
        p.amount,
        p.createdBy || "",
      ]),
      [],
      ["NOTES HISTORY"],
      ["Date", "By", "Note"],
      ...notes.map((n) => [n.createdAt.toISOString().slice(0, 16), n.createdBy || "", n.note]),
      [],
      ["ACTIVITY HISTORY"],
      ["Date", "Who", "Action", "Details"],
      ...work.map((w) => [
        w.createdAt.toISOString().slice(0, 16),
        w.fullName,
        w.action,
        w.details || "",
      ]),
    ];
    return csvResponse(`Luxaeon_History_${projectCode}.csv`, rows);
  }

  if (format === "pdf") {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const burgundy = rgb(0.36, 0.1, 0.11);
    let y = 800;
    const draw = (text: string, b = false, size = 10) => {
      page.drawText(String(text).slice(0, 90), {
        x: 50,
        y,
        size,
        font: b ? bold : font,
        color: b ? burgundy : rgb(0.1, 0.1, 0.1),
      });
      y -= size + 5;
    };
    draw("LUXAEON SPACES — Project History", true, 14);
    draw(`${project.projectCode} · ${project.clientName}`, true, 11);
    draw(`Fee ${project.designFee.toLocaleString()} | Paid ${project.amountPaid.toLocaleString()} | Balance ${balance.toLocaleString()}`);
    y -= 6;
    draw("Payment history", true, 11);
    payments.forEach((p) =>
      draw(`${p.date || ""}  ${p.txnId}  ₦${p.amount.toLocaleString()}  ${p.description || ""}`.slice(0, 85), false, 8)
    );
    if (!payments.length) draw("No payments yet", false, 9);
    y -= 6;
    draw("Notes", true, 11);
    notes.slice(0, 12).forEach((n) => draw(`${n.createdAt.toISOString().slice(0, 10)} — ${n.note}`.slice(0, 85), false, 8));
    y -= 6;
    draw("Activity", true, 11);
    work.slice(0, 15).forEach((w) =>
      draw(`${w.createdAt.toISOString().slice(0, 10)} ${w.fullName}: ${w.action}`.slice(0, 85), false, 8)
    );
    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Luxaeon_History_${projectCode}.pdf"`,
      },
    });
  }

  // Word-like HTML that Word opens
  if (format === "word" || format === "doc" || format === "docx") {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Project History ${project.projectCode}</title>
<style>body{font-family:Calibri,Arial;margin:40px;color:#333}
h1{color:#5c1a1c}h2{color:#5c1a1c;border-bottom:1px solid #c9a227;padding-bottom:4px}
table{border-collapse:collapse;width:100%;margin:12px 0}
th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:12px}
th{background:#f7f3eb}</style></head><body>
<h1>Luxaeon Spaces — Project History</h1>
<p><b>${project.projectCode}</b> · ${project.clientName}<br>
Stage: ${project.stage} · Status: ${project.status}<br>
Design fee: ₦${project.designFee.toLocaleString()} · Paid: ₦${project.amountPaid.toLocaleString()} · <b>Balance: ₦${balance.toLocaleString()}</b></p>
<h2>Payment history</h2>
<table><tr><th>Date</th><th>Txn ID</th><th>Description</th><th>Amount</th><th>By</th></tr>
${payments
  .map(
    (p) =>
      `<tr><td>${p.date || ""}</td><td>${p.txnId}</td><td>${p.description || ""}</td><td>₦${p.amount.toLocaleString()}</td><td>${p.createdBy || ""}</td></tr>`
  )
  .join("")}
${payments.length ? "" : "<tr><td colspan=5>No payments yet</td></tr>"}
</table>
<h2>Notes history</h2>
<table><tr><th>Date</th><th>By</th><th>Note</th></tr>
${notes
  .map(
    (n) =>
      `<tr><td>${n.createdAt.toISOString().slice(0, 16)}</td><td>${n.createdBy || ""}</td><td>${n.note}</td></tr>`
  )
  .join("")}
</table>
<h2>Activity history</h2>
<table><tr><th>Date</th><th>Who</th><th>Action</th><th>Details</th></tr>
${work
  .map(
    (w) =>
      `<tr><td>${w.createdAt.toISOString().slice(0, 16)}</td><td>${w.fullName}</td><td>${w.action}</td><td>${w.details || ""}</td></tr>`
  )
  .join("")}
</table>
<p style="color:#666;font-size:11px">Generated ${new Date().toISOString()} · Luxaeon Spaces</p>
</body></html>`;
    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/msword",
        "Content-Disposition": `attachment; filename="Luxaeon_History_${projectCode}.doc"`,
      },
    });
  }

  return NextResponse.json({ error: "format must be csv|pdf|word" }, { status: 400 });
}
