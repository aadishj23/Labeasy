"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  FlaskConical,
  Package as PackageIcon,
  Building2,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TestCard from "@/components/TestCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Test } from "@/lib/types";

type Pkg = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number | null;
  lab: { lab_name: string };
  _count: { items: number };
};

const Tests = ({
  initialTests = [],
  initialPackages = [],
}: {
  initialTests?: Test[];
  initialPackages?: Pkg[];
}) => {
  const [tab, setTab] = useState<"tests" | "packages">("tests");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const filteredTests = useMemo(
    () =>
      !q
        ? initialTests
        : initialTests.filter((t) => t.test_name?.toLowerCase().includes(q)),
    [initialTests, q]
  );

  const filteredPackages = useMemo(
    () =>
      !q
        ? initialPackages
        : initialPackages.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.lab.lab_name.toLowerCase().includes(q)
          ),
    [initialPackages, q]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative spotlight">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-28 lg:px-8 lg:pt-36">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Diagnostic catalogue
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
              Browse{" "}
              <span className="text-gradient-primary">
                {tab === "tests" ? "tests" : "packages"}
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              {tab === "tests"
                ? "Search from our catalogue and compare prices across accredited labs."
                : "Curated test bundles from labs — more tests, better value."}
            </p>

            {/* Toggle */}
            <div className="mx-auto mt-6 inline-flex rounded-xl border border-border bg-card p-1">
              {(
                [
                  { key: "tests", label: "Tests", icon: FlaskConical },
                  { key: "packages", label: "Packages", icon: PackageIcon },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                    tab === key
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="relative mx-auto mt-6 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={
                  tab === "tests" ? "Search for a test..." : "Search packages..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        {tab === "tests" ? (
          filteredTests.length === 0 ? (
            <EmptyState
              icon={<FlaskConical className="h-6 w-6" />}
              text={query ? `No tests match "${query}".` : "No tests available."}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  name={test.test_name}
                  slug={test.slug || test.id}
                  turnaround={test.turnaround_hours ?? 12}
                />
              ))}
            </div>
          )
        ) : filteredPackages.length === 0 ? (
          <EmptyState
            icon={<PackageIcon className="h-6 w-6" />}
            text={
              query ? `No packages match "${query}".` : "No packages available yet."
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((p) => (
              <Link
                key={p.id}
                href={`/package/${p.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <PackageIcon className="h-6 w-6" />
                  </span>
                  {p.mrp && p.mrp > p.price && (
                    <Badge variant="warning">Save ₹{p.mrp - p.price}</Badge>
                  )}
                </div>
                <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug">
                  {p.name}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  {p.lab.lab_name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p._count.items} tests included
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold">₹{p.price}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        {icon}
      </span>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

export default Tests;
