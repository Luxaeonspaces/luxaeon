import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectCode = new URL(req.url).searchParams.get("projectCode");
  const all = new URL(req.url).searchParams.get("all") === "1";

  const where = projectCode ? { projectCode } : all ? undefined : undefined;
  if (!projectCode && !all) {
    return NextResponse.json({ error: "projectCode or all=1 required" }, { status: 400 });
  }

  const rowsDb = await prisma.procurementRequest.findMany({
    where: projectCode ? { projectCode } : undefined,
    include: { documents: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const rows = [
    ["Luxaeon Spaces — Procurement Export"],
    ["Project", projectCode || "ALL"],
    ["Exported", new Date().toISOString()],
    [],
    [
      "Title",
      "Project Code",
      "Category",
      "Estimated Cost (₦)",
      "Vendor",
      "Payee",
      "Bank",
      "Account",
      "Requested by",
      "Department",
      "Status",
      "HOD Approved by",
      "Founder Approved by",
      "Finance Released by",
      "Linked Txn",
      "Description",
      "Docs count",
      "Created",
    ],
    ...rowsDb.map((r) => [
      r.title,
      r.projectCode || "",
      r.category || "",
      r.estimatedCost,
      r.vendorPreferred || "",
      r.payeeName || "",
      r.payeeBankName || "",
      r.payeeAccountNo || "",
      r.requestedBy,
      r.department || "",
      r.status,
      r.hodApprovedBy || "",
      r.founderApprovedBy || "",
      r.financeReleasedBy || "",
      r.linkedTxnId || "",
      (r.description || "").replace(/\n/g, " "),
      r.documents?.length || 0,
      r.createdAt.toISOString().slice(0, 19),
    ]),
  ];

  const name = projectCode
    ? `Luxaeon_Procurement_${projectCode}.csv`
    : "Luxaeon_Procurement_All.csv";
  return csvResponse(name, rows);
}
