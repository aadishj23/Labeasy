"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Building2, ShieldAlert, ArrowLeft } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SENSITIVE = [
  { key: "lab_name", label: "Lab name" },
  { key: "owner_name", label: "Owner name" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "pincode", label: "Pincode" },
  { key: "license_no", label: "License no." },
  { key: "gst_no", label: "GST no." },
];

export default function LabProfile() {
  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<any>(null);
  const [pending, setPending] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const res = await fetch("/api/v1/labs/profile", { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setLab(d.lab);
      setPending(d.pending);
      setForm(d.lab);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/v1/labs/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.message || "Could not save.");
        return;
      }
      if (d.pending) {
        setMsg("Saved. Changes to verified details were sent for admin approval.");
      } else {
        setMsg("Profile updated.");
      }
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <Link
          href="/labsdashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mb-8 mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Lab profile</h1>
            <p className="text-muted-foreground">
              Update your details. Verified fields need admin approval.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !lab ? (
          <p className="text-muted-foreground">Please sign in as a lab.</p>
        ) : (
          <>
            {pending && (
              <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="flex items-center gap-2 font-medium text-amber-300">
                  <ShieldAlert className="h-4 w-4" /> Pending admin approval
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {Object.entries(pending.changes || {}).map(([k, v]) => (
                    <li key={k}>
                      <span className="capitalize">{k.replace(/_/g, " ")}</span>:{" "}
                      <span className="text-foreground">{String(v)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={save} className="space-y-8">
              {/* Self-service */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Contact & service</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  These apply immediately.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone || ""}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={form.email || ""} disabled />
                  </div>
                  <label className="flex items-center gap-3 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={!!form.home_collection}
                      onChange={(e) => set("home_collection", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm">Offer home sample collection</span>
                  </label>
                </div>
              </div>

              {/* Verified details */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  Verified details
                  <Badge variant="warning">needs approval</Badge>
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Changing these submits a request for admin review.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SENSITIVE.map((f) => (
                    <div
                      key={f.key}
                      className={`space-y-2 ${f.key === "address" ? "sm:col-span-2" : ""}`}
                    >
                      <Label htmlFor={f.key}>{f.label}</Label>
                      <Input
                        id={f.key}
                        value={form[f.key] || ""}
                        onChange={(e) => set(f.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {err && <p className="text-sm text-destructive">{err}</p>}
              {msg && <p className="text-sm text-emerald-400">{msg}</p>}
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </Button>
            </form>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
