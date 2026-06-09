"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, ShieldCheck, HeartPulse, Star } from "lucide-react";
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
import { useAuthStore } from "@/store/useAuthStore";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const rupee = (paise: number) => `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;

export default function InsurancePlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<any>(null);
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState<{ discount: number; final: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [applying, setApplying] = useState(false);
  const [buying, setBuying] = useState(false);

  const applyCoupon = async () => {
    if (!active || !coupon.trim()) return;
    setApplying(true);
    setCouponMsg("");
    setCouponInfo(null);
    try {
      const res = await fetch("/api/v1/coupons/validate-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerType: "INSURANCE", ownerId: active.companyId, code: coupon.trim(), amount: active.price }),
      });
      const d = await res.json();
      if (d.valid) setCouponInfo({ discount: d.discount, final: d.final });
      else setCouponMsg(d.message || "Invalid coupon.");
    } finally {
      setApplying(false);
    }
  };
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userType = useAuthStore((s) => s.type);

  useEffect(() => {
    fetch("/api/v1/insurance/plans/browse", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { plans: [] }))
      .then((d) => setPlans(d.plans || []))
      .finally(() => setLoading(false));
  }, []);

  const open = (p: any) => {
    setActive(p);
    setCoupon("");
    setCouponInfo(null);
    setCouponMsg("");
    // Log a lead (interest) — fire and forget.
    fetch("/api/v1/insurance/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: p.companyId, planId: p.id }),
    }).catch(() => {});
  };

  const buy = async (p: any) => {
    if (!isLoggedIn || userType !== "user") {
      toast.error("Please sign in as a patient to buy.");
      return;
    }
    setBuying(true);
    try {
      const res = await fetch("/api/v1/insurance/plans/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: p.id, couponCode: coupon.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not start checkout.");
        return;
      }
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Could not load payment gateway.");
        return;
      }
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "Labeasy — Insurance",
        theme: { color: "#22d3ee" },
        handler: async (resp: any) => {
          const v = await fetch("/api/v1/insurance/plans/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              purchaseId: data.purchaseId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (v.ok) {
            toast.success("Policy purchased!");
            setActive(null);
          } else {
            toast.error("Payment could not be verified.");
          }
        },
        modal: { ondismiss: () => toast.info("Purchase cancelled.") },
      });
      // Close the Radix dialog first so its pointer-events lock is gone before
      // Razorpay mounts (otherwise the payment iframe is non-interactive).
      setActive(null);
      setBuying(false);
      setTimeout(() => rzp.open(), 300);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Health insurance plans</h1>
          <p className="mt-3 text-muted-foreground">
            Compare plans from partner insurers and buy in a few taps.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : plans.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
            <HeartPulse className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3">Insurance plans are coming soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => open(p)}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-glow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {p.featured && <Badge variant="default">Featured</Badge>}
                  <Badge variant="secondary" className="w-fit">{p.companyName}</Badge>
                  {p.rating_count > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-amber-400">
                      <Star className="h-3 w-3 fill-current" /> {p.rating_avg}
                      <span className="text-muted-foreground">({p.rating_count})</span>
                    </span>
                  )}
                </div>
                <h2 className="mt-3 font-semibold">{p.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-4 text-2xl font-bold">{rupee(p.price)}</p>
                <span className="mt-3 text-sm font-medium text-primary">View &amp; buy →</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> {active?.name}
            </DialogTitle>
            <DialogDescription>{active?.companyName}</DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{active?.description}</p>
          <div className="mt-3 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponInfo(null); setCouponMsg(""); }}
              placeholder="Coupon code (optional)"
              className="h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button variant="outline" onClick={applyCoupon} disabled={applying || !coupon.trim()}>
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
          {couponMsg && <p className="mt-1 text-sm text-destructive">{couponMsg}</p>}
          {couponInfo && (
            <p className="mt-1 text-sm text-emerald-400">
              Coupon applied — you save {rupee(couponInfo.discount)}.
            </p>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
            <span className="text-2xl font-bold">
              {active ? rupee(couponInfo ? couponInfo.final : active.price) : ""}
              {active && couponInfo && <span className="ml-2 text-sm font-normal text-muted-foreground line-through">{rupee(active.price)}</span>}
            </span>
            <Button variant="gradient" onClick={() => active && buy(active)} disabled={buying}>
              {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
