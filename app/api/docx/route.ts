import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fillDocxTemplate, contextFromProjectCode } from "@/lib/docxFill";
import type { TemplateContext } from "@/lib/templateMap";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const type = String(body.type || "invoice");
    const projectCode = body.projectCode as string | undefined;

    if (!projectCode) {
      return NextResponse.json({ error: "projectCode required for live data fill" }, { status: 400 });
    }

    let ctx: TemplateContext = await contextFromProjectCode(projectCode, {
      invoiceNo: body.invoiceNo || undefined,
      dueDate: body.dueDate || undefined,
      phase: body.phase || undefined,
      lineItems: body.lineItems || undefined,
      designFee: body.amount != null ? Number(body.amount) : undefined,
      amountPaid: body.amountPaid != null ? Number(body.amountPaid) : undefined,
      clientName: body.clientName || undefined,
      extraDescription: body.extraDescription || undefined,
    });

    const { buffer, filename } = await fillDocxTemplate(type, ctx);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "DOCX generation failed" }, { status: 500 });
  }
}

/** GET ?type=invoice&projectCode=LX-... for simple download links */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "invoice";
    const projectCode = url.searchParams.get("projectCode");
    if (!projectCode) {
      return NextResponse.json({ error: "projectCode required" }, { status: 400 });
    }
    const ctx = await contextFromProjectCode(projectCode);
    const { buffer, filename } = await fillDocxTemplate(type, ctx);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "DOCX failed" }, { status: 500 });
  }
}
