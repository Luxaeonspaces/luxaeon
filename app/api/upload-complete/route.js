import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      kind = "project",
      filename,
      originalName,
      category = "General",
      description,
      procurementId,
      outflowId,
      transactionId,
      userId,
      projectCode,
      uploadedByRole,
      uploadedBy: uploadedByName,
    } = body;

    if (!filename || !originalName) {
      return NextResponse.json({ error: "filename and originalName required" }, { status: 400 });
    }

    if (kind === "procurement") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const doc = await prisma.procurementDocument.create({
        data: {
          procurementId,
          filename,
          originalName,
          uploadedBy: session.user.fullName || "Staff",
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename });
    }

    if (kind === "outflow") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const doc = await prisma.outflowDocument.create({
        data: {
          outflowId,
          filename,
          originalName,
          uploadedBy: session.user.fullName || "Staff",
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename });
    }

    if (kind === "finance") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
      if (!txn) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      const doc = await prisma.transactionDocument.create({
        data: {
          transactionId,
          filename,
          originalName,
          category,
          uploadedBy: session.user.fullName || "Finance",
        },
      });
      await prisma.transactionAudit
        .create({
          data: {
            transactionId,
            txnId: txn.txnId,
            action: "Document Uploaded",
            details: `${category}: ${originalName}`,
            performedBy: session.user.fullName || "Finance",
            role: session.user.role || null,
            department: session.user.department || null,
          },
        })
        .catch(() => {});
      return NextResponse.json({ ok: true, id: doc.id, filename });
    }

    if (kind === "employee") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const doc = await prisma.employeeDocument.create({
        data: {
          userId,
          filename,
          originalName,
          category,
          description: description || null,
          uploadedBy: session.user.fullName || "HR",
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename });
    }

    // project / client
    const project = await prisma.project.findUnique({ where: { projectCode } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const session = await getServerSession(authOptions);
    const uploader =
      uploadedByName ||
      session?.user?.fullName ||
      (uploadedByRole === "client" ? project.clientName : "Staff");

    if (kind === "client") {
      const doc = await prisma.clientDocument.create({
        data: {
          projectCode,
          filename,
          originalName,
          uploadedBy: uploader,
          uploadedByRole,
          description: description || null,
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename });
    }

    const doc = await prisma.projectFile.create({
      data: {
        projectCode,
        filename,
        originalName,
        uploadedBy: uploader,
        category,
        description: description || null,
      },
    });
    return NextResponse.json({ ok: true, id: doc.id, filename });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Could not save upload record" }, { status: 500 });
  }
}