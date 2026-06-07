import { verifyAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({ authenticated: true, email: admin.email });
}
