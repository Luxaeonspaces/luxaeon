import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isDemoFounderLogin } from "@/lib/demoAuth";

/** Pre-check so the UI can show disabled/deleted clearly (NextAuth often hides custom errors). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    if (!username || !password) {
      return NextResponse.json({ ok: false, code: "MISSING" });
    }
    if (isDemoFounderLogin(username, password)) {
      return NextResponse.json({ ok: true });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ ok: false, code: "DELETED" });
    }
    if (!user.active) {
      return NextResponse.json({ ok: false, code: "DISABLED" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, code: "INVALID" });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, code: "ERROR" }, { status: 500 });
  }
}
