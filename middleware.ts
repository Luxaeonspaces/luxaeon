import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  const isAppHost = host === "app.luxaeonspaces.com" || host.startsWith("app.");
  const isRootRequest = pathname === "/";

  if (isAppHost && isRootRequest) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
