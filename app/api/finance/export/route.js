import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { logTxnAudit } from "@/lib/txnAudit";

export const runtime = "nodejs";

function esc(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const format = (searchParams.get("format") || "csv").toLowerCase();
  const typeFilter = searchParams.get("type"); // Income | Expense

  const rows = id
    ? await prisma.transaction.findMany({ where: { id } })
    : await prisma.transaction.findMany({
        where: typeFilter ? { type: typeFilter } : undefined,
        orderBy: { createdAt: "desc" },
        take: 500,
      });

  if (!rows.length) return NextResponse.json({ error: "No data" }, { status: 404 });

  const u = session.user;
  for (const r of rows.slice(0, 20)) {
    await logTxnAudit({
      transactionId: r.id,
      txnId: r.txnId,
      action: "Exported",
      details: `Export ${format}${id ? " (single)" : " (batch)"}`,
      performedBy: u.fullName,
    });
  }
  if (!id) {
    await logTxnAudit({
      action: "Exported",
      details: `Full transaction export (${rows.length} rows, ${format})`,
      performedBy: u.fullName,
    });
  }

  if (format === "csv") {
    const headers = ["Txn ID", "Date", "Type", "Category", "Description", "Amount", "Project", "Client", "Sales Person", "Created By"];
    const body = rows.map((t) =>
      [t.txnId, t.date, t.type, t.category, t.description, t.amount, t.projectCode, t.clientName, t.salesPersonName, t.createdBy].map(esc).join(",")
    );
    const csv = [headers.join(","), ...body].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${id ? rows[0].txnId : typeFilter ? typeFilter.toLowerCase() + "_transactions" : "all_transactions"}.csv"`,
      },
    });
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595, 842]);
  let y = 800;
  const line = (text, b = false) => {
    page.drawText(text.slice(0, 90), { x: 40, y, size: 10, font: b ? bold : font, color: rgb(0.1, 0.1, 0.1) });
    y -= 14;
  };
  line("LUXAEON SPACES — TRANSACTIONS", true);
  for (const t of rows.slice(0, 40)) {
    line(`${t.txnId} | ${t.date} | ${t.type} | NGN ${t.amount.toLocaleString()}`);
    line(`  ${t.description || ""} · ${t.salesPersonName || ""}`, false);
    if (y < 60) break;
  }
  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="transactions.pdf"`,
    },
  });
}