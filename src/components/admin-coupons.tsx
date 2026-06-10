"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Trash2, Ticket } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EMPTY = {
  code: "", type: "PERCENT", value: "", scope: "ALL",
  max_discount: "", min_order: "", usage_limit: "", per_user_limit: "",
};
const SCOPE_LABEL: Record<string, string> = {
  ALL: "All vendors", LAB: "Labs", DOCTOR: "Doctors", INSURANCE: "Insurers",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/coupons");
      if (res.ok) setCoupons((await res.json()).coupons || []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!form.code.trim() || !Number(form.value)) {
      setErr("Code and a valid value are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await adminFetch("/api/v1/admin/coupons", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ ...EMPTY });
        load();
      } else {
        setErr((await res.json()).message || "Could not create coupon.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string, active: boolean) => {
    await adminFetch(`/api/v1/admin/coupons/${id}`, { method: "PATCH", body: JSON.stringify({ active }) });
    load();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    await adminFetch(`/api/v1/admin/coupons/${id}`, { method: "DELETE" });
    load();
  };

  const field =
    "h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Admin coupons are funded by Labeasy — the discount is borne by us and the
        vendor is still paid the full amount (we keep our usual commission).
      </p>

      <form onSubmit={create} className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input className={field} placeholder="CODE *" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} />
          <select className={field} value={form.scope} onChange={(e) => set("scope", e.target.value)}>
            {Object.entries(SCOPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div className="flex gap-2">
            <select className={field} value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="PERCENT">Percent %</option>
              <option value="FLAT">Flat ₹</option>
            </select>
            <input className={field} type="number" placeholder="Value *" value={form.value} onChange={(e) => set("value", e.target.value)} />
          </div>
          <input className={field} type="number" placeholder="Max discount ₹ (optional)" value={form.max_discount} onChange={(e) => set("max_discount", e.target.value)} />
          <input className={field} type="number" placeholder="Min order ₹ (optional)" value={form.min_order} onChange={(e) => set("min_order", e.target.value)} />
          <input className={field} type="number" placeholder="Total uses (optional)" value={form.usage_limit} onChange={(e) => set("usage_limit", e.target.value)} />
          <input className={field} type="number" placeholder="Per-user uses (optional)" value={form.per_user_limit} onChange={(e) => set("per_user_limit", e.target.value)} />
        </div>
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <Button type="submit" variant="gradient" className="mt-4" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create coupon
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">No admin coupons yet.</div>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary"><Ticket className="h-4 w-4" /></span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{c.code}</span>
                    <Badge variant="secondary">{SCOPE_LABEL[c.scope] || c.scope}</Badge>
                    <Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Active" : "Off"}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.type === "PERCENT" ? `${c.value}% off` : `₹${c.value} off`}
                    {c.max_discount ? ` · max ₹${c.max_discount}` : ""}
                    {c.min_order ? ` · min ₹${c.min_order}` : ""}
                    {` · used ${c.used_count}${c.usage_limit ? `/${c.usage_limit}` : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggle(c.id, !c.active)}>{c.active ? "Disable" : "Enable"}</Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => remove(c.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
