"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EMPTY = { name: "", description: "", price: "", commission_pct: "10" };

export default function InsurancePlansManage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () =>
    fetch("/api/v1/insurance/plans", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { plans: [] }))
      .then((d) => setPlans(d.plans || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(Math.round(p.price / 100)),
      commission_pct: String(p.commission_pct),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    if (!form.name.trim() || !form.description.trim() || !Number(form.price)) {
      setMsg("Name, description and price are required.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        commission_pct: Number(form.commission_pct) || 0,
      };
      const res = editingId
        ? await fetch(`/api/v1/insurance/plans/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/v1/insurance/plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (res.ok) {
        reset();
        load();
      } else {
        setMsg((await res.json()).message || "Could not save.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: any) => {
    await fetch(`/api/v1/insurance/plans/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this plan?")) return;
    await fetch(`/api/v1/insurance/plans/${id}`, { method: "DELETE" });
    load();
  };

  const field =
    "h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Plans</h1>
            <p className="text-muted-foreground">
              New plans / commission changes go live after admin approval.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">{editingId ? "Edit plan" : "Add a plan"}</h2>
          <div className="space-y-3">
            <input className={field} placeholder="Plan name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className={`${field} min-h-[90px] py-2`} placeholder="Detailed description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min={1} className={field} placeholder="Price (₹) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input type="number" min={0} max={100} className={field} placeholder="Commission %" value={form.commission_pct} onChange={(e) => setForm({ ...form, commission_pct: e.target.value })} />
            </div>
            {msg && <p className="text-sm text-destructive">{msg}</p>}
            <div className="flex gap-2">
              <Button variant="gradient" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? "Save changes" : "Add plan"}
              </Button>
              {editingId && <Button variant="ghost" onClick={reset}>Cancel</Button>}
            </div>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold">Your plans ({plans.length})</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No plans yet.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.name}</h3>
                    <Badge variant={p.active ? "success" : "secondary"}>{p.active ? "Active" : "Hidden"}</Badge>
                    <Badge variant={p.commission_approved ? "success" : "warning"}>
                      {p.commission_approved ? "Live" : "Pending approval"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ₹{Math.round(p.price / 100).toLocaleString("en-IN")} · {p.commission_pct}% commission
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggle(p)}>{p.active ? "Hide" : "Show"}</Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => startEdit(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
