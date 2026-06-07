"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Building2,
  Home,
  Calendar,
  ClipboardList,
  ArrowRight,
  Star,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STATUS_META: Record<string, { label: string; variant: any }> = {
  PLACED: { label: "Awaiting payment", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  SAMPLE_COLLECTED: { label: "Sample collected", variant: "default" },
  PROCESSING: { label: "Processing", variant: "default" },
  REPORT_READY: { label: "Report ready", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

const rupees = (paise: number) => `₹${Math.round(paise / 100)}`;

function Bookings() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // review dialog
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewErr, setReviewErr] = useState("");
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewExisting, setReviewExisting] = useState(false);

  useEffect(() => {
    fetch("/api/v1/orders/mine", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const openReview = async (order: any) => {
    setRating(5);
    setComment("");
    setReviewErr("");
    setReviewDone(false);
    setReviewExisting(false);
    setReviewOrder(order);
    // Pre-fill if the patient already reviewed this lab (one review per lab, editable).
    try {
      const res = await fetch(`/api/v1/reviews?labId=${order.lab_id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const d = await res.json();
        if (d.review) {
          setRating(d.review.rating);
          setComment(d.review.comment || "");
          setReviewExisting(true);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const submitReview = async () => {
    if (!reviewOrder) return;
    setSubmitting(true);
    setReviewErr("");
    try {
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labId: reviewOrder.lab_id,
          orderId: reviewOrder.id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewErr(data.message || "Could not submit review.");
        return;
      }
      setReviewDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">My bookings</h1>
            <p className="text-muted-foreground">Track your test orders.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <ClipboardList className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">No bookings yet</h2>
              <p className="mt-1 text-muted-foreground">
                Book a test to see it here.
              </p>
            </div>
            <Button asChild variant="gradient">
              <Link href="/tests">
                Browse tests <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const meta = STATUS_META[order.status] || {
                label: order.status,
                variant: "secondary",
              };
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold">{order.lab?.lab_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.items.map((it: any) => (
                      <span
                        key={it.id}
                        className="rounded-lg bg-secondary/40 px-2.5 py-1 text-sm"
                      >
                        {it.test_name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      {order.collection_type === "HOME" ? (
                        <>
                          <Home className="h-4 w-4" /> Home collection
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" /> Lab visit
                        </>
                      )}
                    </span>
                    {order.scheduled_at && (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.scheduled_at).toLocaleString()}
                      </span>
                    )}
                    <span className="text-base font-bold">
                      {rupees(order.total)}
                    </span>
                  </div>

                  {order.status !== "PLACED" && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReview(order)}
                      >
                        <Star className="h-4 w-4" />
                        Rate lab
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={!!reviewOrder}
        onOpenChange={(o) => !o && setReviewOrder(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {reviewExisting ? "Edit your review of" : "Rate"}{" "}
              {reviewOrder?.lab?.lab_name}
            </DialogTitle>
            <DialogDescription>
              {reviewExisting
                ? "You've reviewed this lab — update your rating below."
                : "Share your experience to help other patients."}
            </DialogDescription>
          </DialogHeader>

          {reviewDone ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="font-medium">Thanks for your review!</p>
              <Button variant="outline" onClick={() => setReviewOrder(null)}>
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        n <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about the experience (optional)"
                rows={3}
                className="flex w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {reviewErr && (
                <p className="text-sm text-destructive">{reviewErr}</p>
              )}
              <Button
                variant="gradient"
                className="w-full"
                onClick={submitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : reviewExisting ? (
                  "Update review"
                ) : (
                  "Submit review"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default Bookings;
