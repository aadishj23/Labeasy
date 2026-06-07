import jwt from "jsonwebtoken";

/**
 * Admin auth is intentionally separate from patient/lab sessions:
 *  - Admin token is a JWT with role:"admin", stored in the browser's
 *    sessionStorage (per-tab; cleared on tab close) and sent as a Bearer header.
 *  - It is NEVER set as the `session` cookie, and patient/lab cookie tokens
 *    (type user|lab) can never satisfy verifyAdmin because role !== "admin".
 */
export function createAdminToken(email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ role: "admin", email }, secret, { expiresIn: "8h" });
}

export function verifyAdmin(request: Request): { email: string } | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(authHeader.slice(7), secret) as {
      role?: string;
      email?: string;
    };
    if (decoded.role !== "admin" || !decoded.email) return null;
    return { email: decoded.email };
  } catch {
    return null;
  }
}
