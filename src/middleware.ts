import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Role-gated pages. Wrong role -> home; not signed in -> the relevant sign-in.
const RULES: { prefix: string; role: "lab" | "user"; signin: string }[] = [
  { prefix: "/labsdashboard", role: "lab", signin: "/signinlab" },
  { prefix: "/results", role: "user", signin: "/signinuser" },
];

async function getRole(token?: string): Promise<string | null> {
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return (payload as { type?: string }).type ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = RULES.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
  );
  if (!rule) return NextResponse.next();

  const role = await getRole(request.cookies.get("session")?.value);

  if (!role) {
    return NextResponse.redirect(new URL(rule.signin, request.url));
  }
  if (role !== rule.role) {
    // Signed in, but wrong role for this page -> send home.
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/labsdashboard", "/labsdashboard/:path*", "/results", "/results/:path*"],
};
