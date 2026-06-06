import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtp() {
  // 6-digit numeric code, zero-padded.
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Create and persist an OTP for an email + purpose, replacing any previous
 * pending codes for the same pair. Returns the plaintext code (to email).
 */
export async function createOtp(email, purpose) {
  const code = generateOtp();
  const code_hash = await bcrypt.hash(code, 10);
  const normalized = email.toLowerCase().trim();

  await prisma.otp.deleteMany({ where: { email: normalized, purpose } });
  await prisma.otp.create({
    data: {
      email: normalized,
      code_hash,
      purpose,
      expires_at: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return code;
}

/**
 * Returns how many milliseconds the caller must wait before another OTP can be
 * issued for this email + purpose (0 if a new code can be sent now). Used to
 * rate-limit send-otp requests.
 */
export async function getResendWaitMs(email, purpose, cooldownMs = 20000) {
  const normalized = email.toLowerCase().trim();
  const last = await prisma.otp.findFirst({
    where: { email: normalized, purpose },
    orderBy: { created_at: "desc" },
  });
  if (!last) return 0;
  const elapsed = Date.now() - new Date(last.created_at).getTime();
  return Math.max(0, cooldownMs - elapsed);
}

/**
 * Verify an OTP for an email + purpose. On success the code is consumed
 * (deleted) so it can't be reused. Returns true/false.
 */
export async function verifyOtp(email, purpose, code) {
  if (!code) return false;
  const normalized = email.toLowerCase().trim();

  const records = await prisma.otp.findMany({
    where: { email: normalized, purpose },
    orderBy: { created_at: "desc" },
  });

  for (const record of records) {
    if (record.expires_at < new Date()) continue;
    const ok = await bcrypt.compare(String(code), record.code_hash);
    if (ok) {
      // consume all codes for this email + purpose
      await prisma.otp.deleteMany({ where: { email: normalized, purpose } });
      return true;
    }
  }
  return false;
}
