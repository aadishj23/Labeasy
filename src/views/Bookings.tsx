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
  FileText,
  Stethoscope,
  ShieldCheck,
  ChevronDown,
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

// Always render booking times in IST.
const IST = "Asia/Kolkata";
const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("en-IN", { timeZone: IST, dateStyle: "medium", timeStyle: "short" });
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { timeZone: IST });

function Bookings() {
  const [orders, setOrders] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "tests" | "doctors" | "insurance">("all");
  const [loading, setLoading] = useState(true);
  // vendor review dialog (doctor / insurer)
  const [reviewTarget, setReviewTarget] = useState<
    { targetType: "DOCTOR" | "INSURANCE"; targetId: string; name: string } | null
  >(null);
  const [vRating, setVRating] = useState(5);
  const [vComment, setVComment] = useState("");
  const [vMsg, setVMsg] = useState("");

  const openVendorReview = (t: {
    targetType: "DOCTOR" | "INSURANCE";
    targetId: string;
    name: string;
  }) => {
    setVMsg("");
    const existing = reviewsByTarget[`${t.targetType}:${t.targetId}`];
    setVRating(existing?.rating || 5);
    setVComment(existing?.comment || "");
    setReviewTarget(t);
  };

  // review dialog
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewErr, setReviewErr] = useState("");
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewExisting, setReviewExisting] = useState(false);
  // labId -> existing review ({ rating, comment }), so we can label/prefill instantly
  const [reviewsByLab, setReviewsByLab] = useState<Record<string, any>>({});
  // "TYPE:id" -> existing review, for doctors & insurers
  const [reviewsByTarget, setReviewsByTarget] = useState<Record<string, any>>({});

  // Prefetch the user's reviews so rate buttons show "Edit review · N★".
  const loadReviews = () =>
    fetch("/api/v1/reviews", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => {
        const labMap: Record<string, any> = {};
        const targetMap: Record<string, any> = {};
        (d.reviews || []).forEach((rv: any) => {
          targetMap[`${rv.target_type}:${rv.target_id}`] = rv;
          if (rv.target_type === "LAB") labMap[rv.target_id] = rv;
        });
        setReviewsByLab(labMap);
        setReviewsByTarget(targetMap);
      })
      .catch(() => {});

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/orders/mine", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { orders: [] }
      ),
      fetch("/api/v1/appointments/mine", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { appointments: [] }
      ),
      fetch("/api/v1/insurance/purchases/mine", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { purchases: [] }
      ),
    ])
      .then(([o, a, p]) => {
        setOrders(o.orders || []);
        setAppts(a.appointments || []);
        setPolicies(p.purchases || []);
      })
      .finally(() => setLoading(false));

    loadReviews();
  }, []);

  const openReview = (order: any) => {
    const existing = reviewsByLab[order.lab_id];
    setRating(existing?.rating ?? 5);
    setComment(existing?.comment ?? "");
    setReviewErr("");
    setReviewDone(false);
    setReviewExisting(!!existing);
    setReviewOrder(order);
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
          targetType: "LAB",
          targetId: reviewOrder.lab_id,
          refId: reviewOrder.id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewErr(data.message || "Could not submit review.");
        return;
      }
      // Reflect the new/updated review locally so buttons show "Edit review".
      setReviewsByLab((m) => ({
        ...m,
        [reviewOrder.lab_id]: { rating, comment },
      }));
      setReviewExisting(true);
      setReviewDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const showOrders = tab === "all" || tab === "tests" ? orders : [];
  const showAppts = tab === "all" || tab === "doctors" ? appts : [];
  const showPolicies = tab === "all" || tab === "insurance" ? policies : [];

  // One list, newest first — across tests, consults & policies.
  const items = [
    ...showAppts.map((a: any) => ({ kind: "appt", date: a.scheduled_at, data: a })),
    ...showOrders.map((o: any) => ({ kind: "order", date: o.created_at, data: o })),
    ...showPolicies.map((p: any) => ({ kind: "policy", date: p.created_at, data: p })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const submitVendorReview = async () => {
    if (!reviewTarget) return;
    setVMsg("");
    const res = await fetch("/api/v1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: reviewTarget.targetType,
        targetId: reviewTarget.targetId,
        rating: vRating,
        comment: vComment,
      }),
    });
    if (res.ok) {
      setReviewTarget(null);
      loadReviews();
    } else {
      setVMsg((await res.json()).message || "Could not submit review.");
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
            <p className="text-muted-foreground">Tests, consultations & insurance.</p>
          </div>
        </div>

        {/* Type filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { v: "all", label: "All" },
            { v: "tests", label: "Lab tests" },
            { v: "doctors", label: "Doctors" },
            { v: "insurance", label: "Insurance" },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v as any)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                tab === t.v
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : showOrders.length === 0 && showAppts.length === 0 && showPolicies.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <ClipboardList className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Nothing here yet</h2>
              <p className="mt-1 text-muted-foreground">
                {tab === "doctors" ? "Book a consultation to see it here." : tab === "insurance" ? "Buy a plan to see it here." : "Book a test to see it here."}
              </p>
            </div>
            <Button asChild variant="gradient">
              <Link href={tab === "doctors" ? "/doctors" : tab === "insurance" ? "/insurance" : "/tests"}>
                {tab === "doctors" ? "Find a doctor" : tab === "insurance" ? "Browse plans" : "Browse tests"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it: any) => {
              // Doctor appointment
              if (it.kind === "appt") {
                const a = it.data;
                const open = openId === a.id;
                return (
              <div key={a.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button onClick={() => setOpenId(open ? null : a.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Stethoscope className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{a.doctor?.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {a.doctor?.specialty} · {fmtDate(a.scheduled_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.status === "COMPLETED" ? "success" : a.status === "CANCELLED" ? "destructive" : "default"}>
                      {a.status}
                    </Badge>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open && (
                  <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
                    <p className="text-muted-foreground">{fmtDateTime(a.scheduled_at)} · {rupees(a.fee)}</p>
                    {(a.doctor?.clinic || a.doctor?.city) && (
                      <p className="text-muted-foreground">{[a.doctor?.clinic, a.doctor?.city].filter(Boolean).join(", ")}</p>
                    )}
                    {a.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openVendorReview({ targetType: "DOCTOR", targetId: a.doctor_id, name: a.doctor?.name || "doctor" })}
                      >
                        <Star className={`h-4 w-4 ${reviewsByTarget[`DOCTOR:${a.doctor_id}`] ? "fill-amber-400 text-amber-400" : ""}`} />
                        {reviewsByTarget[`DOCTOR:${a.doctor_id}`]
                          ? `Edit review · ${reviewsByTarget[`DOCTOR:${a.doctor_id}`].rating}★`
                          : `Rate ${a.doctor?.name || "doctor"}`}
                      </Button>
                    )}
                  </div>
                )}
              </div>
                );
              }

              // Lab order
              if (it.kind === "order") {
                const order = it.data;
                const meta = STATUS_META[order.status] || {
                  label: order.status,
                  variant: "secondary",
                };
                const open = openId === order.id;
                return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <button onClick={() => setOpenId(open ? null : order.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold">{order.lab?.lab_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {fmtDate(order.created_at)} · {order.items?.length} test{order.items?.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {open && (
                  <div className="border-t border-border p-5">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((it: any) => (
                      <span
                        key={it.id}
                        className="rounded-lg bg-secondary/40 px-2.5 py-1 text-sm"
                      >
                        {it.test_name}
                      </span>
                    ))}
                  </div>

                  {order.status === "CANCELLED" && order.cancel_reason && (
                    <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      Cancelled by lab: {order.cancel_reason}
                    </div>
                  )}

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
                        {fmtDateTime(order.scheduled_at)}
                      </span>
                    )}
                    <span className="text-base font-bold">
                      {rupees(order.total)}
                    </span>
                  </div>

                  {(order.reports?.length > 0 || order.status !== "PLACED") && (
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                      {order.reports?.map((r: any, i: number) => (
                        <Button key={r.id} asChild variant="secondary" size="sm">
                          <a
                            href={r.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4" />
                            {order.reports.length > 1
                              ? `Report ${i + 1}`
                              : "Download report"}
                          </a>
                        </Button>
                      ))}
                      {order.status !== "PLACED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReview(order)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              reviewsByLab[order.lab_id]
                                ? "fill-amber-400 text-amber-400"
                                : ""
                            }`}
                          />
                          {reviewsByLab[order.lab_id]
                            ? `Edit review · ${reviewsByLab[order.lab_id].rating}★`
                            : `Rate ${order.lab?.lab_name || "lab"}`}
                        </Button>
                      )}
                    </div>
                  )}
                  </div>
                  )}
                </div>
                );
              }

              // Insurance policy
              const p = it.data;
              const open = openId === p.id;
              return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button onClick={() => setOpenId(open ? null : p.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{p.plan?.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {p.company?.name} · {fmtDate(p.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{rupees(p.amount)}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open && (
                  <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
                    <p className="text-muted-foreground">Purchased {fmtDateTime(p.created_at)} · {rupees(p.amount)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openVendorReview({ targetType: "INSURANCE", targetId: p.company.id, name: p.company?.name || "insurer" })}
                    >
                      <Star className={`h-4 w-4 ${reviewsByTarget[`INSURANCE:${p.company.id}`] ? "fill-amber-400 text-amber-400" : ""}`} />
                      {reviewsByTarget[`INSURANCE:${p.company.id}`]
                        ? `Edit review · ${reviewsByTarget[`INSURANCE:${p.company.id}`].rating}★`
                        : `Rate ${p.company?.name}`}
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

      {/* Vendor review dialog (doctor / insurer) */}
      <Dialog open={!!reviewTarget} onOpenChange={(o) => !o && setReviewTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rate {reviewTarget?.name}</DialogTitle>
            <DialogDescription>
              {reviewTarget?.targetType === "DOCTOR"
                ? "Share your experience with this doctor."
                : "Share your experience with this insurer."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setVRating(n)} aria-label={`${n} stars`}>
                  <Star className={`h-6 w-6 ${n <= vRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <textarea
              value={vComment}
              onChange={(e) => setVComment(e.target.value)}
              placeholder="Your review (optional)"
              className="min-h-[70px] w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {vMsg && <p className="text-sm text-destructive">{vMsg}</p>}
            <Button variant="gradient" className="w-full" onClick={submitVendorReview}>
              Submit review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default Bookings;
