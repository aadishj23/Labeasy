import { Prisma } from "@prisma/client";

/** Human-friendly label for a unique field that collided. */
const UNIQUE_FIELD_MESSAGES: Record<string, string> = {
  email: "An account with this email already exists.",
  phone: "This phone number is already registered.",
  license_no: "This license number is already registered.",
  gst_no: "This GST number is already registered.",
  lab_name: "A lab with this name already exists.",
  test_name: "A test with this name already exists.",
};

/**
 * Maps a Prisma error to a friendly JSON Response, or returns null if it isn't
 * a known/handled error (caller should fall back to a generic 500).
 */
export function prismaErrorResponse(error: unknown): Response | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    const field = Array.isArray(target) ? target[0] : String(target ?? "");
    const message =
      UNIQUE_FIELD_MESSAGES[field] ||
      "Some of these details are already registered.";
    return Response.json({ message }, { status: 409 });
  }
  return null;
}

export function forbidden(message = "Forbidden") {
  return Response.json({ message }, { status: 403 });
}

/** The configured admin email (reserved — cannot be used for patient/lab accounts). */
export function isAdminEmail(email: string): boolean {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return !!admin && email.toLowerCase().trim() === admin;
}
