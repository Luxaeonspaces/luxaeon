import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const batchId = new URL(req.url).searchParams.get("batchId");
  if (!batchId) return NextResponse.json({ error: "batchId required" }, { status: 400 });
  const batch = await prisma.payrollBatch.findUnique({
    where: { id: batchId },
    include: { records: true },
  });
  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lines = [
    ["Period", batch.period],
    ["Status", batch.status],
    ["Prepared by", batch.preparedBy || ""],
    ["Employee count", String(batch.employeeCount)],
    ["Total net", String(batch.totalNet)],
    [],
    ["Employee", "Basic", "Allowances", "Deductions", "Net"],
    ...batch.records.map((r) => [
      r.employeeName,
      String(r.basicSalary),
      String(r.allowances),
      String(r.deductions),
      String(r.netPay),
    ]),
  ];
  const csv = lines.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="payroll_${batch.period.replace(/\s+/g, "_")}.csv"`,
    },
  });
}
