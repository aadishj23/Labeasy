import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const partners = await prisma.insurancePartner.findMany({
    orderBy: { created_at: "asc" },
    include: { _count: { select: { leads: true } } },
  });
  return Response.json({ partners });
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const b = await request.json().catch(() => ({}));
  const name = (b.name || "").trim();
  const referral_url = (b.referral_url || "").trim();
  if (!name || !referral_url) {
    return Response.json(
      { message: "Name and referral URL are required." },
      { status: 400 }
    );
  }
  try {
    new URL(referral_url);
  } catch {
    return Response.json(
      { message: "Referral URL must be a valid URL." },
      { status: 400 }
    );
  }

  const slug = (b.slug ? slugify(b.slug) : slugify(name)) || slugify(name);

  const existing = await prisma.insurancePartner.findUnique({ where: { slug } });
  if (existing) {
    return Response.json(
      { message: "A partner with this slug already exists." },
      { status: 409 }
    );
  }

  const partner = await prisma.insurancePartner.create({
    data: {
      name,
      slug,
      logo_url: b.logo_url?.trim() || null,
      blurb: b.blurb?.trim() || null,
      plan_highlights: Array.isArray(b.plan_highlights)
        ? b.plan_highlights.map((h: string) => h.trim()).filter(Boolean)
        : [],
      referral_url,
      test_discount_pct: Math.max(0, Math.min(100, Number(b.test_discount_pct) || 0)),
      commission_note: b.commission_note?.trim() || null,
      active: b.active !== false,
    },
  });
  return Response.json({ partner });
}
