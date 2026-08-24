import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectCode = new URL(req.url).searchParams.get("projectCode");
  if (!projectCode) return NextResponse.json({ error: "projectCode required" }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { projectCode } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const notes = await prisma.projectNote.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const files = await prisma.projectFile.findMany({ where: { projectCode } });
  const proc = await prisma.procurementRequest.findMany({ where: { projectCode } });

  const rows = [
    ["Luxaeon Spaces — Project Details Export"],
    ["Generated from live data + Documents & Templates structure"],
    ["Exported", new Date().toISOString()],
    [],
    ["Field", "Value"],
    ["Project Code", project.projectCode],
    ["Client", project.clientName],
    ["Project Name", project.projectName || ""],
    ["Location", project.location || ""],
    ["Stage", project.stage],
    ["Status", project.status],
    ["Design Fee (₦)", project.designFee],
    ["Amount Paid (₦)", project.amountPaid],
    ["Balance (₦)", Math.max(0, project.designFee - project.amountPaid)],
    ["Sales Person", project.salesPersonName || ""],
    ["Created By", project.createdBy || ""],
    ["Target Handover", project.targetHandover || ""],
    ["Client Access Code", project.clientAccessCode || ""],
    ["Notes", project.notes || ""],
    [],
    ["Internal Notes"],
    ["Date", "By", "Note"],
    ...notes.map((n) => [n.createdAt.toISOString().slice(0, 16), n.createdBy || "", n.note]),
    [],
    ["Files"],
    ["Name", "Category"],
    ...files.map((f) => [f.originalName || f.filename, f.category || ""]),
    [],
    ["Procurement linked to this project"],
    ["Title", "Cost (₦)", "Status", "Vendor"],
    ...proc.map((p) => [p.title, p.estimatedCost, p.status, p.vendorPreferred || ""]),
  ];

  return csvResponse(`Luxaeon_Project_${projectCode}.csv`, rows);
}
