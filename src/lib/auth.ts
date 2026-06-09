import { getSession } from "@/lib/session";

export type AuthData = {
  type: "user" | "lab" | "doctor" | "insurance";
  labID?: string;
  userID?: string;
  doctorID?: string;
  insuranceID?: string;
};

/**
 * Resolves the current principal from the httpOnly session cookie.
 * Returns { type, ...id } on success, or null when unauthenticated.
 */
export async function verifyAuth(): Promise<AuthData | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.type === "lab") return { type: "lab", labID: session.labid };
  if (session.type === "doctor")
    return { type: "doctor", doctorID: session.doctorid };
  if (session.type === "insurance")
    return { type: "insurance", insuranceID: session.insuranceid };
  return { type: "user", userID: session.userid };
}

export function unauthorized(message = "Please Login First") {
  return Response.json({ message }, { status: 403 });
}
