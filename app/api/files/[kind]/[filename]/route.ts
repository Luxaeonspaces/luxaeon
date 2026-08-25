import { NextRequest, NextResponse } from "next/server";
import { retrieveFile } from "@/lib/fileStorage";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { kind: string; filename: string } }
) {
  const map: Record<string, string> = {
    client: "client_docs",
    uploads: "uploads",
    hr: "hr_docs",
    finance: "finance_docs",
    outflow: "outflow_docs",
    procurement: "procurement_docs",
  };
  const sub = map[params.kind] || "uploads";
  const filename = path.basename(params.filename);
  try {
    const data = await retrieveFile(sub, filename);
    if (!data) return NextResponse.json({ error: "File not found" }, { status: 404 });
    const ext = filename.split(".").pop()?.toLowerCase();
    const types: Record<string, string> = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      zip: "application/zip",
      csv: "text/csv",
    };
    return new NextResponse(data, {
      headers: {
        "Content-Type": types[ext || ""] || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
