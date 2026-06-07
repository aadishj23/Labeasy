import Razorpay from "razorpay";
import crypto from "crypto";

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_API_KEY;

let client: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY as string,
      key_secret: process.env.RAZORPAY_API_SECRET as string,
    });
  }
  return client;
}

/** Verify the HMAC-SHA256 signature Razorpay returns after a successful payment. */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_API_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  // timing-safe compare
  const a = Buffer.from(expected);
  const b = Buffer.from(params.signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
