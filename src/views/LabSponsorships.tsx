"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Loader2,
  Megaphone,
  ArrowLeft,
  Globe,
  Building2,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SPONSOR_MONTHLY,
  SPONSOR_MONTHS,
  sponsorPrice,
} from "@/lib/sponsored-pricing";

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

const SCOPES = [
  {
    key: "EVERYWHERE",
    label: "Everywhere",
    icon: Globe,
    desc: "Top placement on the labs directory and every relevant test page.",
    price: `₹${SPONSOR_MONTHLY.EVERYWHERE}/mo`,
  },
  {
    key: "DIRECTORY",
    label: "Labs directory",
    icon: Building2,
    desc: "Top of the /labs search results.",
    price: `₹${SPONSOR_MONTHLY.DIRECTORY}/mo`,
  },
  {
    key: "TESTS",
    label: "Specific tests",
    icon: FlaskConical,
    desc: `Top of chosen test pages. ₹${SPONSOR_MONTHLY.TEST}/test/mo · ₹${SPONSOR_MONTHLY.TEST_BUNDLE}/test for 3+ (bundle).`,
    price: "from ₹" + SPONSOR_MONTHLY.TEST_BUNDLE + "/test/mo",
  },
];

const scopeLabel = (l: any) =>
  l.scope === "EVERYWHERE"
    ? "Everywhere"
    : l.scope === "DIRECTORY"
      ? "Labs directory"
      : `${l.test_names?.length || l.test_ids.length} test(s)`;

export default function LabSponsorships() {
  const [labTests, setLabTests] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("EVERYWHERE");
  const [months, setMonths] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0); // paise

  const load = async () => {
    try {
      const [testsRes, listRes, walletRes] = await Promise.all([
        axios.post("/api/v1/tests/gettestsforlab"),
        fetch("/api/v1/labs/sponsorships", { cache: "no-store" }).then((r) =>
          r.ok ? r.json() : { listings: [] }
        ),
        fetch("/api/v1/labs/wallet", { cache: "no-store" }).then((r) =>
          r.ok ? r.json() : { balance: 0 }
        ),
      ]);
      setLabTests(testsRes.data.tests || []);
      setListings(listRes.listings || []);
      setWalletBalance(walletRes.balance || 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const price = sponsorPrice({
    scope,
    testCount: selected.length,
    months,
  });
  const walletRupees = Math.max(0, Math.round(walletBalance / 100));
  const fromWallet = Math.min(walletRupees, price);
  const payOnline = price - fromWallet;

  const pay = async () => {
    if (scope === "TESTS" && selected.length === 0) {
      toast.error("Select at least one test to promote.");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/v1/labs/sponsorships/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, months, testIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not start checkout.");
        return;
      }
      // Fully covered by wallet balance — no online payment needed.
      if (data.covered) {
        toast.success("Sponsorship activated from your wallet!");
        setSelected([]);
        load();
        setPaying(false);
        return;
      }
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Could not load the payment gateway.");
        return;
      }
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "Labeasy — Sponsorship",
        theme: { color: "#22d3ee" },
        handler: async (resp: any) => {
          const v = await fetch("/api/v1/labs/sponsorships/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              listingId: data.listingId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (v.ok) {
            toast.success("Sponsorship activated!");
            setSelected([]);
            load();
          } else {
            toast.error("Payment could not be verified. Contact support.");
          }
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

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <Link
          href="/labsdashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mb-8 mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Promote your lab</h1>
            <p className="text-muted-foreground">
              Get top placement in search results.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Builder */}
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-medium">Placement</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SCOPES.map((sc) => {
                    const Icon = sc.icon;
                    return (
                      <button
                        key={sc.key}
                        type="button"
                        onClick={() => setScope(sc.key)}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          scope === sc.key
                            ? "border-primary/60 bg-primary/10"
                            : "border-border hover:bg-secondary/40"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <p className="mt-2 font-semibold">{sc.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {sc.desc}
                        </p>
                        <p className="mt-2 text-sm font-medium text-primary">
                          {sc.price}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {scope === "TESTS" && (
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Tests to promote{" "}
                    <span className="text-muted-foreground">
                      ({selected.length} selected{selected.length >= 3 && " · bundle rate"})
                    </span>
                  </p>
                  {labTests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add tests to your catalogue first.
                    </p>
                  ) : (
                    <div className="grid max-h-60 gap-1 overflow-y-auto rounded-xl border border-border p-2 sm:grid-cols-2">
                      {labTests.map((t) => (
                        <label
                          key={t.test_id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary/40"
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(t.test_id)}
                            onChange={() => toggle(t.test_id)}
                            className="h-4 w-4 accent-primary"
                          />
                          {t.test_name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">Duration</p>
                <div className="flex gap-2">
                  {SPONSOR_MONTHS.map((m) => (
                    <button
                      key={m}
                      type="button"
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
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="h-5 w-5 text-primary" /> Summary
                </h2>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Placement</span>
                    <span className="text-foreground">
                      {SCOPES.find((s) => s.key === scope)?.label}
                    </span>
                  </div>
                  {scope === "TESTS" && (
                    <div className="flex justify-between">
                      <span>Tests</span>
                      <span className="text-foreground">{selected.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="text-foreground">{months} mo</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span>₹{price}</span>
                  </div>
                  {fromWallet > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>From wallet (₹{walletRupees} available)</span>
                      <span>−₹{fromWallet}</span>
                    </div>
                  )}
                  <div className="flex items-end justify-between pt-1">
                    <span className="text-muted-foreground">Pay now</span>
                    <span className="text-2xl font-bold">₹{payOnline}</span>
                  </div>
                </div>
                <Button
                  variant="gradient"
                  className="mt-4 w-full"
                  onClick={pay}
                  disabled={paying || price <= 0}
                >
                  {paying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : payOnline === 0 ? (
                    "Activate from wallet"
                  ) : (
                    `Pay ₹${payOnline} & activate`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active sponsorships */}
        {!loading && listings.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold">Active sponsorships</h2>
            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{scopeLabel(l)}</Badge>
                      {l.test_names?.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {l.test_names.join(", ")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Until{" "}
                      {l.ends_at
                        ? new Date(l.ends_at).toLocaleDateString()
                        : "—"}{" "}
                      · paid ₹{Math.round(l.amount / 100)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
