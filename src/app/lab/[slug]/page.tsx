import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, MapPin, Star, BadgeCheck, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

const DISCOUNT = 0.8;

async function getLab(slug: string) {
  const lab = await prisma.lab.findUnique({
    where: { slug },
    include: {
      labTests: { where: { active: true } },
      reviews: {
        where: { status: "published" },
        orderBy: { created_at: "desc" },
        take: 12,
      },
    },
  });
  return lab;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lab = await prisma.lab.findUnique({ where: { slug } });
  if (!lab) return { title: "Lab not found | Labeasy" };
  return {
    title: `${lab.lab_name}${lab.city ? `, ${lab.city}` : ""} — tests & prices | Labeasy`,
    description: `Book diagnostic tests at ${lab.lab_name}${lab.city ? ` in ${lab.city}` : ""}. Compare prices and book online with Labeasy.`,
    alternates: { canonical: `/lab/${slug}` },
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = await getLab(slug).catch(() => null);
  if (!lab || lab.status !== "VERIFIED") redirect("/");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: lab.lab_name,
    address: {
      "@type": "PostalAddress",
      addressLocality: lab.city,
      addressRegion: lab.state,
      postalCode: lab.pincode,
    },
    ...(lab.rating_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: lab.rating_avg,
            reviewCount: lab.rating_count,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative spotlight">
        <div className="mx-auto max-w-4xl px-6 pb-8 pt-28 lg:px-8 lg:pt-36">
          <Link
            href="/tests"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Browse tests
          </Link>
          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Building2 className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{lab.lab_name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {(lab.city || lab.state) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {[lab.city, lab.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {lab.rating_count > 0 && (
                  <Badge variant="success" className="gap-1">
                    {lab.rating_avg.toFixed(1)}
                    <Star className="h-3 w-3 fill-current" /> ({lab.rating_count})
                  </Badge>
                )}
                {lab.status === "VERIFIED" && (
                  <Badge variant="default" className="gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </Badge>
                )}
              </div>
              {lab.accreditations?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {lab.accreditations.map((a: string) => (
                    <Badge key={a} variant="outline">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
        <h2 className="mb-4 text-lg font-semibold">
          Tests offered{" "}
          <span className="text-muted-foreground">({lab.labTests.length})</span>
        </h2>
        {lab.labTests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-12 text-center text-muted-foreground">
            This lab hasn&apos;t listed any tests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {lab.labTests.map((lt) => {
              const discounted = Math.round(Number(lt.test_price) * DISCOUNT);
              return (
                <div
                  key={lt.test_id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <p className="font-medium">{lt.test_name}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold">₹{discounted}</div>
                      <div className="text-xs text-muted-foreground line-through">
                        ₹{lt.test_price}
                      </div>
                    </div>
                    <AddToCartButton
                      testId={lt.test_id}
                      testName={lt.test_name}
                      labId={lt.lab_id}
                      labName={lab.lab_name}
                      price={discounted}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {lab.reviews.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
          <h2 className="mb-4 text-lg font-semibold">
            Reviews{" "}
            <span className="text-muted-foreground">({lab.rating_count})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {lab.reviews.map((r: any) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? "fill-current" : "opacity-25"}`}
                    />
                  ))}
                </div>
                {r.comment && (
                  <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
                )}
                <p className="mt-3 text-xs font-medium text-foreground/80">
                  {r.reviewer_name || "Verified patient"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
