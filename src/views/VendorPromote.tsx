"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Megaphone, Sparkles } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function VendorPromote() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(1);
  const [paying, setPaying] = useState(false);

  const load = () =>
    fetch("/api/v1/vendor/promote", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const monthlyPrice = data?.monthlyPrice ?? 1500;
  const price = monthlyPrice * months;
  const walletRupees = Math.max(0, Math.round((data?.balance ?? 0) / 100));
  const fromWallet = Math.min(walletRupees, price);
  const payOnline = price - fromWallet;

  const pay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/v1/vendor/promote/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });
      const d = await res.json();
      if (!res.ok) return toast.error(d.message || "Could not start checkout.");
      if (d.covered) {
        toast.success("Featured placement activated from your wallet!");
        setPaying(false);
        load();
        return;
      }
      const ok = await loadRazorpay();
      if (!ok) return toast.error("Could not load payment gateway.");
      const rzp = new (window as any).Razorpay({
        key: d.keyId,
        order_id: d.razorpayOrderId,
        amount: d.amount,
        currency: d.currency,
        name: "Labeasy — Featured placement",
        theme: { color: "#22d3ee" },
        handler: async (resp: any) => {
          const v = await fetch("/api/v1/vendor/promote/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              listingId: d.listingId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (v.ok) {
            toast.success("Featured placement activated!");
            load();
          } else toast.error("Payment could not be verified.");
        },
        modal: { ondismiss: () => toast.info("Payment cancelled.") },
      });
      setPaying(false);
      setTimeout(() => rzp.open(), 200);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Get featured</h1>
            <p className="text-muted-foreground">Appear at the top of search results.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !data ? (
          <p className="text-muted-foreground">Please sign in.</p>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Featured placement is <span className="font-medium text-foreground">₹{monthlyPrice}/month</span>.
              </p>
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Duration</p>
                <div className="flex gap-2">
                  {(data.months || [1, 3, 6]).map((m: number) => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                        months === m
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {m} {m === 1 ? "month" : "months"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>₹{price}</span></div>
                {fromWallet > 0 && (
                  <div className="flex justify-between text-emerald-400"><span>From wallet (₹{walletRupees} available)</span><span>−₹{fromWallet}</span></div>
                )}
                <div className="flex items-end justify-between pt-1"><span className="text-muted-foreground">Pay now</span><span className="text-2xl font-bold">₹{payOnline}</span></div>
              </div>
              <Button variant="gradient" className="mt-4 w-full" onClick={pay} disabled={paying}>
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : payOnline === 0 ? "Activate from wallet" : `Pay ₹${payOnline} & feature`}
              </Button>
            </div>

            {data.listings.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">Active placements</h2>
                <div className="space-y-2">
                  {data.listings.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                      <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Featured</span>
                      <span className="text-xs text-muted-foreground">
                        until {l.ends_at ? new Date(l.ends_at).toLocaleDateString() : "—"} · paid ₹{Math.round(l.amount / 100)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
