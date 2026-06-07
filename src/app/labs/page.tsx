import type { Metadata } from "next";
import Link from "next/link";
import { Search, Building2, MapPin, Star, BadgeCheck, FlaskConical } from "lucide-react";
import prisma from "@/lib/prisma";
import { resolvePincode, isPincode } from "@/lib/geo";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { liveSponsoredLabIds } from "@/lib/sponsored";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find diagnostic labs near you | Labeasy",
  description:
    "Search NABL-accredited diagnostic labs by city or pincode, compare ratings, and book tests online with Labeasy.",
  alternates: { canonical: "/labs" },
};

type Search = { q?: string; sort?: string };

async function getLabs({ q, sort }: Search) {
  const where: any = { status: "VERIFIED" };
  let resolvedCity: string | null = null;

  if (q && q.trim()) {
    const term = q.trim();
    if (isPincode(term)) {
      const resolved = await resolvePincode(term);
      resolvedCity = resolved?.city ?? null;
      where.OR = [
        { pincode: term },
        ...(resolvedCity
          ? [{ city: { contains: resolvedCity, mode: "insensitive" } }]
          : []),
      ];
    } else {
      where.OR = [
        { city: { contains: term, mode: "insensitive" } },
        { lab_name: { contains: term, mode: "insensitive" } },
      ];
    }
  }

  const orderBy =
    sort === "name"
      ? { lab_name: "asc" as const }
      : { rating_avg: "desc" as const };

  const labs = await prisma.lab.findMany({
    where,
    orderBy,
    select: {
      id: true,
      lab_name: true,
      slug: true,
      city: true,
      state: true,
      rating_avg: true,
      rating_count: true,
      accreditations: true,
      _count: { select: { labTests: true } },
    },
    take: 60,
  });

  return { labs, resolvedCity };
}

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const sort = sp.sort ?? "rating";
  const { labs, resolvedCity } = await getLabs({ q, sort });

  // Pin directory-sponsored labs to the top (stable within the chosen sort).
  const sponsored = await liveSponsoredLabIds().catch(() => new Set<string>());
  labs.sort(
    (a, b) => (sponsored.has(b.id) ? 1 : 0) - (sponsored.has(a.id) ? 1 : 0)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative spotlight">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-28 lg:px-8 lg:pt-36">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Lab directory
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
              Find <span className="text-gradient-primary">labs</span> near you
            </h1>
            <p className="mt-4 text-muted-foreground">
              Search accredited labs by city or pincode.
            </p>

            <form
              action="/labs"
              method="get"
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="City or 6-digit pincode"
                  className="flex h-12 w-full rounded-md border border-input bg-secondary/40 px-3.5 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <select
                name="sort"
                defaultValue={sort}
                className="h-12 rounded-md border border-input bg-secondary/40 px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="rating">Top rated</option>
                <option value="name">Name (A–Z)</option>
              </select>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-primary via-sky-400 to-cyan-300 px-6 text-sm font-semibold text-primary-foreground"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {labs.length} lab{labs.length !== 1 ? "s" : ""}
          {q ? (
            <>
              {" "}for &ldquo;{q}&rdquo;
              {resolvedCity ? ` (${resolvedCity})` : ""}
            </>
          ) : null}
        </p>

        {labs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
            No labs found. Try a different city or pincode.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab) => (
              <Link
                key={lab.id}
                href={lab.slug ? `/lab/${lab.slug}` : "#"}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-glow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-2">
                    {sponsored.has(lab.id) && (
                      <Badge variant="warning">Sponsored</Badge>
                    )}
                    {lab.rating_count > 0 && (
                      <Badge variant="success" className="gap-1">
                        {lab.rating_avg.toFixed(1)}
                        <Star className="h-3 w-3 fill-current" />
                      </Badge>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 font-semibold leading-snug group-hover:text-primary">
                  {lab.lab_name}
                </h3>
                {(lab.city || lab.state) && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {[lab.city, lab.state].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <FlaskConical className="h-3.5 w-3.5" />
                    {lab._count.labTests} tests
                  </span>
                  {lab.accreditations?.slice(0, 2).map((a: string) => (
                    <Badge key={a} variant="outline" className="gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      {a}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
