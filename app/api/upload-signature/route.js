import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinaryConfig, signParams } from "@/lib/fileStorage";
import { resolveUploadTarget } from "@/lib/uploadTargets";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      kind = "project",
      procurementId,
      outflowId,
      transactionId,
      userId,
      projectCode,
      accessCode,
      uploadedByRole,
      fileName,
      fileSize,
    } = body;

    if (!fileName) {
      return NextResponse.json({ error: "fileName required" }, { status: 400 });
    }
    if (typeof fileSize === "number" && fileSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Files must be 25 MB or smaller" }, { status: 400 });
    }

    // Same auth/access rules as /api/upload, checked BEFORE issuing a signature.
    if (kind === "procurement") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (!procurementId) return NextResponse.json({ error: "procurementId required" }, { status: 400 });
      const row = await prisma.procurementRequest.findUnique({ where: { id: procurementId } });
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    } else if (kind === "outflow") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (!outflowId) return NextResponse.json({ error: "outflowId required" }, { status: 400 });
      const row = await prisma.outflowRequest.findUnique({ where: { id: outflowId } });
      if (!row) return NextResponse.json({ error: "Outflow not found" }, { status: 404 });
    } else if (kind === "finance") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (!transactionId) return NextResponse.json({ error: "transactionId required" }, { status: 400 });
      const row = await prisma.transaction.findUnique({ where: { id: transactionId } });
      if (!row) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    } else if (kind === "employee") {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      const row = await prisma.user.findUnique({ where: { id: userId } });
      if (!row) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    } else {
      // project / client
      if (!projectCode) return NextResponse.json({ error: "projectCode required" }, { status: 400 });
      const project = await prisma.project.findUnique({ where: { projectCode } });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      if (kind === "client" && uploadedByRole === "client") {
        if (!accessCode || accessCode !== project.clientAccessCode) {
          return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
        }
      } else {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const cfg = cloudinaryConfig();
    if (!cfg) {
      return NextResponse.json(
        { error: "Direct upload requires Cloudinary to be configured (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)" },
        { status: 500 }
      );
    }

    const { subdir, filename } = resolveUploadTarget({
      kind,
      procurementId,
      outflowId,
      transactionId,
      userId,
      projectCode,
      fileName,
    });

    const folder = `${cfg.folder}/${subdir}`;
    const publicId = filename.replace(/\.[^./]+$/, "");
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signParams({ folder, public_id: publicId, overwrite: "true", timestamp: String(timestamp) }, cfg.apiSecret);

    return NextResponse.json({
      cloudName: cfg.cloudName,
      apiKey: cfg.apiKey,
      timestamp,
      signature,
      folder,
      publicId,
      filename, // pass this straight to /api/upload-complete afterwards
      subdir,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Could not prepare upload" }, { status: 500 });
  }
}