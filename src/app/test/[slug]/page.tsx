import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FlaskConical, Star, MapPin, Building2, ArrowLeft, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

const DISCOUNT = 0.8;

async function getTest(slug: string) {
  const test = await prisma.tests.findUnique({ where: { slug } });
  if (!test) return null;
  const labTests = await prisma.labTest.findMany({
    where: {
      test_id: test.id,
      active: true,
      lab: { status: "VERIFIED" }, // only show approved labs publicly
    },
    include: {
      lab: {
        select: {
          lab_name: true,
          slug: true,
          city: true,
          rating_avg: true,
          rating_count: true,
        },
      },
    },
  });
  labTests.sort((a, b) => Number(a.test_price) - Number(b.test_price));
  return { test, labTests };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = await prisma.tests.findUnique({ where: { slug } });
  if (!test) return { title: "Test not found | Labeasy" };
  return {
    title: `${test.test_name} — compare lab prices & book | Labeasy`,
    description: `Compare prices for ${test.test_name} across accredited labs and book online with Labeasy. ${test.test_description?.slice(0, 120) ?? ""}`,
    alternates: { canonical: `/test/${slug}` },
  };
}

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { city = "", sort = "price" } = await searchParams;
  const data = await getTest(slug).catch(() => null);
  if (!data) redirect("/");
  const { test, labTests: allLabTests } = data;

  // Distinct cities for the filter dropdown
  const cityList: string[] = allLabTests
    .map((lt: any) => (lt.lab?.city ? String(lt.lab.city) : ""))
    .filter((c: string) => c.length > 0);
  const cities: string[] = Array.from(new Set<string>(cityList)).sort();

  // Apply city filter + sort
  let labTests = city
    ? allLabTests.filter((lt) => lt.lab.city === city)
    : [...allLabTests];
  labTests.sort((a, b) =>
    sort === "rating"
      ? (b.lab.rating_avg || 0) - (a.lab.rating_avg || 0)
      : Number(a.test_price) - Number(b.test_price)
  );

  const prices = allLabTests.map((lt) => Math.round(Number(lt.test_price) * DISCOUNT));
  const lowest = prices.length ? Math.min(...prices) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalTest",
    name: test.test_name,
    description: test.test_description,
    ...(lowest != null
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: lowest,
            offerCount: labTests.length,
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
            <ArrowLeft className="h-4 w-4" /> All tests
          </Link>
          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <FlaskConical className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{test.test_name}</h1>
              {lowest != null && (
                <p className="mt-2 text-muted-foreground">
                  From <span className="font-semibold text-foreground">₹{lowest}</span>{" "}
                  · {labTests.length} lab{labTests.length > 1 ? "s" : ""} available
                </p>
              )}
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Report in {test.turnaround_hours ?? 12} hrs
              </p>
            </div>
          </div>
          {test.test_description && (
            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
              {test.test_description}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Compare labs</h2>
          {cities.length > 0 && (
            <form
              action={`/test/${slug}`}
              method="get"
              className="flex flex-wrap gap-2"
            >
              <select
                name="city"
                defaultValue={city}
                className="h-9 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                name="sort"
                defaultValue={sort}
                className="h-9 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="price">Cheapest</option>
                <option value="rating">Top rated</option>
              </select>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary"
              >
                Apply
              </button>
            </form>
          )}
        </div>
        {labTests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-12 text-center text-muted-foreground">
            No labs offer this test yet. Please check back soon.
          </div>
        ) : (
          <div className="space-y-3">
            {labTests.map((lt) => {
              const discounted = Math.round(Number(lt.test_price) * DISCOUNT);
              return (
                <div
                  key={lt.lab_id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="min-w-0">
                    <Link
                      href={lt.lab.slug ? `/lab/${lt.lab.slug}` : "#"}
                      className="font-semibold hover:text-primary"
                    >
                      {lt.lab_name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {lt.lab.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {lt.lab.city}
                        </span>
                      )}
                      {lt.lab.rating_count > 0 && (
                        <Badge variant="success" className="gap-1">
                          {lt.lab.rating_avg.toFixed(1)}
                          <Star className="h-3 w-3 fill-current" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold">₹{discounted}</div>
                      <div className="text-xs text-muted-foreground line-through">
                        ₹{lt.test_price}
                      </div>
                    </div>
                    <AddToCartButton
                      testId={lt.test_id}
                      testName={test.test_name}
                      labId={lt.lab_id}
                      labName={lt.lab_name}
                      price={discounted}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
