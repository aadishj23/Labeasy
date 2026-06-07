import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package as PackageIcon, Building2, Check, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

async function getPackage(slug: string) {
  return prisma.package.findUnique({
    where: { slug },
    include: {
      lab: { select: { lab_name: true, slug: true, status: true, id: true } },
      items: { include: { test: { select: { test_name: true, slug: true } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
    include: { lab: { select: { lab_name: true, city: true } } },
  });
  if (!pkg) return { title: "Package not found | Labeasy" };
  return {
    title: `${pkg.name} — ₹${pkg.price} at ${pkg.lab.lab_name} | Labeasy`,
    description: `Book the ${pkg.name} package at ${pkg.lab.lab_name}${
      pkg.lab.city ? ` in ${pkg.lab.city}` : ""
    } for ₹${pkg.price}. ${pkg.description ?? ""}`,
    alternates: { canonical: `/package/${slug}` },
  };
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = await getPackage(slug).catch(() => null);
  if (!pkg || !pkg.active || pkg.lab.status !== "VERIFIED") redirect("/");

  const savings = pkg.mrp && pkg.mrp > pkg.price ? pkg.mrp - pkg.price : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.name,
    description: pkg.description || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: pkg.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative spotlight">
        <div className="mx-auto max-w-3xl px-6 pb-8 pt-28 lg:px-8 lg:pt-36">
          {pkg.lab.slug && (
            <Link
              href={`/lab/${pkg.lab.slug}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {pkg.lab.lab_name}
            </Link>
          )}
          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <PackageIcon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{pkg.name}</h1>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" /> {pkg.lab.lab_name}
              </p>
            </div>
          </div>
          {pkg.description && (
            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
              {pkg.description}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">₹{pkg.price}</span>
                {pkg.mrp && pkg.mrp > pkg.price && (
                  <span className="pb-1 text-muted-foreground line-through">
                    ₹{pkg.mrp}
                  </span>
                )}
              </div>
              {savings && (
                <Badge variant="warning" className="mt-2">
                  Save ₹{savings}
                </Badge>
              )}
            </div>
            <AddToCartButton
              packageId={pkg.id}
              testName={pkg.name}
              labId={pkg.lab.id}
              labName={pkg.lab.lab_name}
              price={pkg.price}
              className="h-11 px-6"
            />
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Includes {pkg.items.length} tests
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {pkg.items.map((it) => (
                <li key={it.id} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {it.test.slug ? (
                    <Link
                      href={`/test/${it.test.slug}`}
                      className="hover:text-primary"
                    >
                      {it.test.test_name}
                    </Link>
                  ) : (
                    it.test.test_name
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
