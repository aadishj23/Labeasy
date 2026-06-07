import { getSession } from "@/lib/session";

export type AuthData = {
  type: "user" | "lab";
  labID?: string;
  userID?: string;
};

/**
 * Resolves the current principal from the httpOnly session cookie.
 * Returns { type, labID | userID } on success, or null when unauthenticated.
 */
export async function verifyAuth(): Promise<AuthData | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.type === "lab") {
    return { type: "lab", labID: session.labid };
  }
  return { type: "user", userID: session.userid };
}

export function unauthorized(message = "Please Login First") {
  return Response.json({ message }, { status: 403 });
}
