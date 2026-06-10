import prisma from "@/lib/prisma";

export type VendorKind = "LAB" | "DOCTOR";

/** Age in whole years from a DOB (or null). */
export function ageFromDob(dob: Date | string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 150 ? age : null;
}

/**
 * Add/refresh a vendor's catalogue entry for a patient, keyed by phone. A
 * booking by a Labeasy user "tags" an existing manual entry with their user_id;
 * otherwise a PLATFORM entry is created. Never overwrites vendor-entered name.
 */
export async function upsertVendorPatient(opts: {
  vendorType: VendorKind;
  vendorId: string;
  name?: string | null;
  phone?: string | null;
  userId?: string | null;
}): Promise<void> {
  const phone = (opts.phone || "").trim();
  if (!phone) return;

  try {
    const existing = await prisma.vendorPatient.findFirst({
      where: { vendor_type: opts.vendorType, vendor_id: opts.vendorId, phone },
    });
    if (existing) {
      if (opts.userId && !existing.user_id) {
        await prisma.vendorPatient.update({
          where: { id: existing.id },
          data: { user_id: opts.userId },
        });
      }
      return;
    }
    await prisma.vendorPatient.create({
      data: {
        vendor_type: opts.vendorType,
        vendor_id: opts.vendorId,
        name: (opts.name || "Patient").trim(),
        phone,
        user_id: opts.userId || null,
        source: opts.userId ? "PLATFORM" : "MANUAL",
      },
    });
  } catch {
    /* best-effort — never block a booking on catalogue bookkeeping */
  }
}
