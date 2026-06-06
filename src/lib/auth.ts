import jwt from "jsonwebtoken";

/**
 * Verifies the Bearer token on an incoming request.
 * Mirrors the old Express middleware (backend/src/middleware/auth.js):
 * returns { type, labID, userID } on success, or null when missing/invalid.
 */
export function verifyAuth(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === "lab") {
      return { type: "lab", labID: decoded.labid };
    }
    return { type: "user", userID: decoded.userid };
  } catch (err) {
    return null;
  }
}

export function unauthorized(message = "Please Login First") {
  return Response.json({ message }, { status: 403 });
}
