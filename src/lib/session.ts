import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 10; // 10 days

export type SessionToken = {
  type: "user" | "lab";
  userid?: string;
  labid?: string;
  name?: string;
};

/** Sign a session and set it as an httpOnly cookie. */
export async function createSession(payload: SessionToken) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const token = jwt.sign(payload, secret, { expiresIn: "10d" });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Read + verify the session cookie. Returns null if missing/invalid. */
export async function getSession(): Promise<SessionToken | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as SessionToken;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
