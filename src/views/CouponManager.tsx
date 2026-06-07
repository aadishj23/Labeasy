"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Ticket, Plus, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DateTimePicker from "@/components/datetime-picker";

const EMPTY = {
  code: "",
  type: "PERCENT",
  value: "",
  max_discount: "",
  min_order: "",
  usage_limit: "",
  per_user_limit: "",
  starts_at: "",
  ends_at: "",
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/v1/labs/coupons", { cache: "no-store" });
      if (res.ok) setCoupons((await res.json()).coupons || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/labs/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.message || "Could not create coupon.");
        return;
      }
      setForm({ ...EMPTY });
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/v1/labs/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/v1/labs/coupons/${id}`, { method: "DELETE" });
    load();
  };

  const describe = (c: any) => {
    const off = c.type === "PERCENT" ? `${c.value}% off` : `₹${c.value} off`;
    const parts = [off];
    if (c.max_discount) parts.push(`up to ₹${c.max_discount}`);
    if (c.min_order) parts.push(`min ₹${c.min_order}`);
    parts.push(
      `used ${c.used_count}${c.usage_limit ? `/${c.usage_limit}` : ""}`
    );
    if (c.per_user_limit) parts.push(`${c.per_user_limit}/user`);
    return parts.join(" · ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <Link
          href="/labsdashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mb-8 mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Ticket className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Coupons</h1>
            <p className="text-muted-foreground">
              Promo codes that apply only to your lab&apos;s tests.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            {/* Create */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">New coupon</h2>
                <form className="mt-5 space-y-4" onSubmit={create}>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={form.code}
                      onChange={(e) => set("code", e.target.value.toUpperCase())}
                      placeholder="LAL20"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={form.type}
                        onChange={(e) => set("type", e.target.value)}
                        className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="PERCENT">% off</option>
                        <option value="FLAT">₹ off</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">
                        {form.type === "PERCENT" ? "Percent" : "Amount (₹)"}
                      </Label>
                      <Input
                        id="value"
                        type="number"
                        value={form.value}
                        onChange={(e) => set("value", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {form.type === "PERCENT" && (
                      <div className="space-y-2">
                        <Label htmlFor="max_discount">Max ₹ (cap)</Label>
                        <Input
                          id="max_discount"
                          type="number"
                          value={form.max_discount}
                          onChange={(e) => set("max_discount", e.target.value)}
                          placeholder="optional"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="min_order">Min order ₹</Label>
                      <Input
                        id="min_order"
                        type="number"
                        value={form.min_order}
                        onChange={(e) => set("min_order", e.target.value)}
                        placeholder="optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="usage_limit">Total uses</Label>
                      <Input
                        id="usage_limit"
                        type="number"
                        value={form.usage_limit}
                        onChange={(e) => set("usage_limit", e.target.value)}
                        placeholder="optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="per_user_limit">Per user</Label>
                      <Input
                        id="per_user_limit"
                        type="number"
                        value={form.per_user_limit}
                        onChange={(e) => set("per_user_limit", e.target.value)}
                        placeholder="optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Starts</Label>
                      <DateTimePicker
                        value={form.starts_at}
                        onChange={(v) => set("starts_at", v)}
                        variant="future"
                        placeholder="Start date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ends</Label>
                      <DateTimePicker
                        value={form.ends_at}
                        onChange={(v) => set("ends_at", v)}
                        variant="future"
                        placeholder="End date"
                      />
                    </div>
                  </div>
                  {err && <p className="text-sm text-destructive">{err}</p>}
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4" />
                    {submitting ? "Creating…" : "Create coupon"}
                  </Button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Your coupons{" "}
                <span className="text-muted-foreground">({coupons.length})</span>
              </h2>
              {coupons.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <Ticket className="h-6 w-6" />
                  </span>
                  <p className="text-muted-foreground">No coupons yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/20 p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-dashed border-primary/50 px-2 py-0.5 font-mono text-sm font-semibold text-primary">
                            {c.code}
                          </span>
                          {!c.active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {describe(c)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggle(c.id, !c.active)}
                        >
                          {c.active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => remove(c.id)}
                          aria-label="Delete coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
