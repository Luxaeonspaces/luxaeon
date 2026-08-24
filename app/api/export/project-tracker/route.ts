import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/excel";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = (new URL(req.url).searchParams.get("format") || "csv").toLowerCase();
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });

  const rowsData = projects.map((p) => ({
    code: p.projectCode,
    client: p.clientName,
    name: p.projectName || "",
    location: p.location || "",
    stage: p.stage,
    status: p.status,
    fee: p.designFee,
    paid: p.amountPaid,
    balance: Math.max(0, p.designFee - p.amountPaid),
    sales: p.salesPersonName || "",
    createdBy: p.createdBy || "",
    handover: p.targetHandover || "",
  }));

  if (format === "csv" || format === "excel") {
    const rows = [
      ["Luxaeon Spaces — Project Tracker"],
      ["Exported", new Date().toISOString()],
      [],
      [
        "Project Code",
        "Client",
        "Project Name",
        "Location",
        "Stage",
        "Status",
        "Design Fee (₦)",
        "Paid (₦)",
        "Balance (₦)",
        "Sales",
        "Created By",
        "Target Handover",
      ],
      ...rowsData.map((r) => [
        r.code,
        r.client,
        r.name,
        r.location,
        r.stage,
        r.status,
        r.fee,
        r.paid,
        r.balance,
        r.sales,
        r.createdBy,
        r.handover,
      ]),
    ];
    return csvResponse("Luxaeon_Project_Tracker.csv", rows);
  }

  if (format === "pdf") {
    const pdf = await PDFDocument.create();
    let page = pdf.addPage([842, 595]); // landscape A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let y = 560;
    page.drawText("Luxaeon Spaces — Project Tracker", {
      x: 40,
      y,
      size: 14,
      font: bold,
      color: rgb(0.36, 0.1, 0.11),
    });
    y -= 22;
    page.drawText("Code | Client | Stage | Fee | Paid | Balance", {
      x: 40,
      y,
      size: 9,
      font: bold,
    });
    y -= 14;
    for (const r of rowsData) {
      if (y < 40) {
        page = pdf.addPage([842, 595]);
        y = 560;
      }
      const line = `${r.code} | ${r.client.slice(0, 18)} | ${r.stage.slice(0, 14)} | ${r.fee.toLocaleString()} | ${r.paid.toLocaleString()} | ${r.balance.toLocaleString()}`;
      page.drawText(line.slice(0, 110), { x: 40, y, size: 8, font });
      y -= 12;
    }
    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Luxaeon_Project_Tracker.pdf"`,
      },
    });
  }

  if (format === "word" || format === "doc") {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Project Tracker</title>
<style>body{font-family:Calibri,Arial;margin:30px}h1{color:#5c1a1c}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:5px;font-size:11px}
th{background:#f7f3eb;color:#5c1a1c}</style></head><body>
<h1>Luxaeon Spaces — Project Tracker</h1>
<p>Exported ${new Date().toLocaleString()}</p>
<table><tr>
<th>Code</th><th>Client</th><th>Name</th><th>Stage</th><th>Status</th>
<th>Fee</th><th>Paid</th><th>Balance</th><th>Sales</th></tr>
${rowsData
  .map(
    (r) =>
      `<tr><td>${r.code}</td><td>${r.client}</td><td>${r.name}</td><td>${r.stage}</td><td>${r.status}</td>
<td>₦${r.fee.toLocaleString()}</td><td>₦${r.paid.toLocaleString()}</td><td>₦${r.balance.toLocaleString()}</td><td>${r.sales}</td></tr>`
  )
  .join("")}
</table></body></html>`;
    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/msword",
        "Content-Disposition": `attachment; filename="Luxaeon_Project_Tracker.doc"`,
      },
    });
  }

  return NextResponse.json({ error: "format must be csv|pdf|word" }, { status: 400 });
}
