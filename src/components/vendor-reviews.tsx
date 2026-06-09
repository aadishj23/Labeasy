"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function VendorReviews({
  endpoint,
  note,
}: {
  endpoint: string;
  note?: string;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Reviews</h1>
            <p className="text-muted-foreground">What your customers say.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <p className="text-muted-foreground">Please sign in.</p>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-amber-400">
                  {data.rating_count > 0 ? data.rating_avg.toFixed(1) : "—"}
                </p>
                <div className="mt-1 flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${
                        n <= Math.round(data.rating_avg)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold">Overall rating</p>
                <p className="text-sm text-muted-foreground">
                  {data.rating_count} review{data.rating_count === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {data.reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
                {note || "No reviews yet."}
              </div>
            ) : (
              <div className="space-y-3">
                {data.reviews.map((r: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.reviewer_name || "Patient"}</span>
                      <span className="inline-flex items-center gap-0.5 text-amber-400">
                        <Star className="h-4 w-4 fill-current" /> {r.rating}
                      </span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
