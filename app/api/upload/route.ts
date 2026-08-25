import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const DOCUMENT_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx", "txt", "zip"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "avi"]);
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function extension(filename: string) {
  return filename.toLowerCase().split(".").pop() || "";
}

function validateUpload(file: File, kind: string) {
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Files must be 25 MB or smaller";
  }
  const ext = extension(file.name);
  const supportsVideo = kind === "client";
  if (!DOCUMENT_EXTENSIONS.has(ext) && !IMAGE_EXTENSIONS.has(ext) && !(supportsVideo && VIDEO_EXTENSIONS.has(ext))) {
    return supportsVideo
      ? "Supported files: documents, images, or videos"
      : "Supported files: documents or images";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const kind = String(form.get("kind") || "project"); // project | client | employee
    const category = String(form.get("category") || "General");
    const description = String(form.get("description") || "");
    const uploadedByRole = String(form.get("uploadedByRole") || "staff");
    const uploadedByName = String(form.get("uploadedBy") || "");

    if (!file) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const uploadError = validateUpload(file, kind);
    if (uploadError) {
      return NextResponse.json({ error: uploadError }, { status: 400 });
    }




    if (kind === "procurement") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const procurementId = String(form.get("procurementId") || "").trim();
      if (!procurementId) return NextResponse.json({ error: "procurementId required" }, { status: 400 });
      const row = await prisma.procurementRequest.findUnique({ where: { id: procurementId } });
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const dir = path.join(process.cwd(), "storage", "procurement_docs");
      await mkdir(dir, { recursive: true });
      const safe = `PROC_${procurementId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
      const doc = await prisma.procurementDocument.create({
        data: {
          procurementId,
          filename: safe,
          originalName: file.name,
          uploadedBy: (session.user as any).fullName || "Staff",
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename: safe });
    }

    if (kind === "outflow") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const outflowId = String(form.get("outflowId") || "").trim();
      if (!outflowId) return NextResponse.json({ error: "outflowId required" }, { status: 400 });
      const outflow = await prisma.outflowRequest.findUnique({ where: { id: outflowId } });
      if (!outflow) return NextResponse.json({ error: "Outflow not found" }, { status: 404 });
      const dir = path.join(process.cwd(), "storage", "outflow_docs");
      await mkdir(dir, { recursive: true });
      const safe = `OUT_${outflowId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
      const doc = await prisma.outflowDocument.create({
        data: {
          outflowId,
          filename: safe,
          originalName: file.name,
          uploadedBy: (session.user as any).fullName || "Staff",
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename: safe });
    }

    // ---- Finance transaction documents ----
    if (kind === "finance") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const transactionId = String(form.get("transactionId") || "").trim();
      if (!transactionId) {
        return NextResponse.json({ error: "transactionId required" }, { status: 400 });
      }
      const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
      if (!txn) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }
      const dir = path.join(process.cwd(), "storage", "finance_docs");
      await mkdir(dir, { recursive: true });
      const safe = `FIN_${transactionId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
      const doc = await prisma.transactionDocument.create({
        data: {
          transactionId,
          filename: safe,
          originalName: file.name,
          category,
          uploadedBy: (session.user as any).fullName || "Finance",
        },
      });
      await prisma.transactionAudit.create({
        data: {
          transactionId,
          txnId: txn.txnId,
          action: "Document Uploaded",
          details: `${category}: ${file.name}`,
          performedBy: (session.user as any).fullName || "Finance",
          role: (session.user as any).role || null,
          department: (session.user as any).department || null,
        },
      }).catch(() => {});
      return NextResponse.json({ ok: true, id: doc.id, filename: safe });
    }

    // ---- Employee HR documents ----
    if (kind === "employee") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const userId = String(form.get("userId") || "").trim();
      if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 });
      }
      const employee = await prisma.user.findUnique({ where: { id: userId } });
      if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }

      const dir = path.join(process.cwd(), "storage", "hr_docs");
      await mkdir(dir, { recursive: true });
      const safe = `HR_${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));

      const doc = await prisma.employeeDocument.create({
        data: {
          userId,
          filename: safe,
          originalName: file.name,
          category,
          description: description || null,
          uploadedBy: (session.user as any).fullName || "HR",
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename: safe });
    }

    // ---- Project / client documents ----
    const projectCode = String(form.get("projectCode") || "").trim();
    if (!projectCode) {
      return NextResponse.json({ error: "projectCode required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { projectCode } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (kind === "client" && uploadedByRole === "client") {
      const access = String(form.get("accessCode") || "");
      if (!access || access !== project.clientAccessCode) {
        return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
      }
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const session = await getServerSession(authOptions);
    const uploader =
      uploadedByName ||
      (session?.user as any)?.fullName ||
      (uploadedByRole === "client" ? project.clientName : "Staff");

    const subdir = kind === "client" ? "client_docs" : "uploads";
    const dir = path.join(process.cwd(), "storage", subdir);
    await mkdir(dir, { recursive: true });

    const safe = `${projectCode}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));

    if (kind === "client") {
      const doc = await prisma.clientDocument.create({
        data: {
          projectCode,
          filename: safe,
          originalName: file.name,
          uploadedBy: uploader,
          uploadedByRole,
          description: description || null,
        },
      });
      return NextResponse.json({ ok: true, id: doc.id, filename: safe });
    }

    const doc = await prisma.projectFile.create({
      data: {
        projectCode,
        filename: safe,
        originalName: file.name,
        uploadedBy: uploader,
        category,
        description: description || null,
      },
    });
    return NextResponse.json({ ok: true, id: doc.id, filename: safe });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
