import prisma from "@/lib/prisma";
import { isAdminEmail } from "@/lib/api";

/**
 * Global, cross-role uniqueness: an email/phone may belong to only ONE account
 * across patients, labs, doctors, and insurers (the admin email is reserved).
 */
export async function emailExists(email: string): Promise<boolean> {
  const e = (email || "").toLowerCase().trim();
  if (!e) return false;
  if (isAdminEmail(e)) return true;
  const [u, l, d, i] = await Promise.all([
    prisma.user.findUnique({ where: { email: e }, select: { id: true } }),
    prisma.lab.findUnique({ where: { email: e }, select: { id: true } }),
    prisma.doctor.findUnique({ where: { email: e }, select: { id: true } }),
    prisma.insuranceCompany.findUnique({ where: { email: e }, select: { id: true } }),
  ]);
  return !!(u || l || d || i);
}

export async function phoneExists(phone: string): Promise<boolean> {
  const p = (phone || "").trim();
  if (!p) return false;
  const [u, l, d] = await Promise.all([
    prisma.user.findUnique({ where: { phone: p }, select: { id: true } }),
    prisma.lab.findUnique({ where: { phone: p }, select: { id: true } }),
    prisma.doctor.findFirst({ where: { phone: p }, select: { id: true } }),
  ]);
  return !!(u || l || d);
}
