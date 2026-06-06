"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, FlaskConical, AlertCircle } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TestCard from "@/components/TestCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const getTestsData = async () => {
      try {
        const response = await axios({
          url: `/api/v1/tests/gettests`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
          },
        });
        setTests(response.data.tests);
      } catch (err) {
        setError("Failed to load tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getTestsData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter((t) => t.test_name?.toLowerCase().includes(q));
  }, [tests, query]);

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
              Browse <span className="text-gradient-primary">tests</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Search from our catalogue and compare prices across accredited labs.
            </p>

            <div className="relative mx-auto mt-8 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a test..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <Skeleton className="mt-4 h-4 w-1/2" />
                <Skeleton className="mt-6 h-10 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <FlaskConical className="h-6 w-6" />
            </span>
            <p className="text-muted-foreground">
              {query ? `No tests match "${query}".` : "No tests available."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((test) => (
              <TestCard key={test.id} name={test.test_name} testId={test.id} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Tests;
