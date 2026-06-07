"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const rupee = (paise: number) =>
  `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;

const EMPTY = {
  name: "",
  slug: "",
  logo_url: "",
  blurb: "",
  referral_url: "",
  test_discount_pct: 0,
  plan_highlights: "",
  commission_note: "",
};

const STATUS_VARIANT: Record<string, any> = {
  CLICKED: "secondary",
  CONVERTED: "success",
  REJECTED: "destructive",
};

export default function AdminInsurance() {
  const [partners, setPartners] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, lRes] = await Promise.all([
        adminFetch("/api/v1/admin/insurance"),
        adminFetch("/api/v1/admin/insurance/leads"),
      ]);
      if (pRes.ok) setPartners((await pRes.json()).partners || []);
      if (lRes.ok) {
        const d = await lRes.json();
        setLeads(d.leads || []);
        setTotalCommission(d.totalCommission || 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      slug: p.slug || "",
      logo_url: p.logo_url || "",
      blurb: p.blurb || "",
      referral_url: p.referral_url || "",
      test_discount_pct: p.test_discount_pct || 0,
      plan_highlights: (p.plan_highlights || []).join("\n"),
      commission_note: p.commission_note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    if (!form.name.trim() || !form.referral_url.trim()) {
      alert("Name and referral URL are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        test_discount_pct: Number(form.test_discount_pct) || 0,
        plan_highlights: form.plan_highlights
          .split("\n")
          .map((h) => h.trim())
          .filter(Boolean),
      };
      const res = editingId
        ? await adminFetch(`/api/v1/admin/insurance/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await adminFetch("/api/v1/admin/insurance", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      if (res.ok) {
        resetForm();
        load();
      } else {
        alert((await res.json()).message || "Could not save.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: any) => {
    await adminFetch(`/api/v1/admin/insurance/${p.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this partner and all its leads?")) return;
    await adminFetch(`/api/v1/admin/insurance/${id}`, { method: "DELETE" });
    load();
  };

  const setLeadStatus = async (lead: any, status: string) => {
    let commission;
    if (status === "CONVERTED") {
      const v = window.prompt("Commission earned (₹):", "0");
      if (v === null) return;
      commission = Number(v) || 0;
    }
    await adminFetch(`/api/v1/admin/insurance/leads/${lead.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, commission }),
    });
    load();
  };

  const input =
    "h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Partner form */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" />
          {editingId ? "Edit partner" : "Add partner"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={input}
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={input}
            placeholder="Slug (auto from name if blank)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <input
            className={input}
            placeholder="Referral URL * (https://...)"
            value={form.referral_url}
            onChange={(e) => setForm({ ...form, referral_url: e.target.value })}
          />
          <input
            className={input}
            placeholder="Logo URL"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
          />
          <input
            type="number"
            min={0}
            max={100}
            className={input}
            placeholder="Test discount %"
            value={form.test_discount_pct}
            onChange={(e) =>
              setForm({ ...form, test_discount_pct: Number(e.target.value) })
            }
          />
          <input
            className={input}
            placeholder="Commission note (internal)"
            value={form.commission_note}
            onChange={(e) =>
              setForm({ ...form, commission_note: e.target.value })
            }
          />
        </div>
        <textarea
          className="mt-3 min-h-[60px] w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Short blurb"
          value={form.blurb}
          onChange={(e) => setForm({ ...form, blurb: e.target.value })}
        />
        <textarea
          className="mt-3 min-h-[80px] w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Plan highlights — one per line"
          value={form.plan_highlights}
          onChange={(e) =>
            setForm({ ...form, plan_highlights: e.target.value })
          }
        />
        <div className="mt-4 flex gap-2">
          <Button variant="gradient" onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingId ? "Save changes" : "Add partner"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Partners list */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Partners ({partners.length})
        </h2>
        {partners.length === 0 ? (
          <p className="text-sm text-muted-foreground">No partners yet.</p>
        ) : (
          <div className="space-y-3">
            {partners.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.name}</h3>
                    <Badge variant={p.active ? "success" : "secondary"}>
                      {p.active ? "Active" : "Hidden"}
                    </Badge>
                    {p.test_discount_pct > 0 && (
                      <Badge variant="default">{p.test_discount_pct}% off</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    /{p.slug} · {p._count?.leads ?? 0} leads
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggle(p)}>
                    {p.active ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => startEdit(p)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(p.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leads */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Referral leads ({leads.length})</h2>
          <span className="text-sm text-muted-foreground">
            Commission earned{" "}
            <span className="font-semibold text-foreground">
              {rupee(totalCommission)}
            </span>
          </span>
        </div>
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 font-medium">{l.partner?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {l.user ? l.user.name : "Guest"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[l.status] || "secondary"}>
                        {l.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {l.commission ? rupee(l.commission) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {l.status !== "CONVERTED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setLeadStatus(l, "CONVERTED")}
                          >
                            Convert
                          </Button>
                        )}
                        {l.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setLeadStatus(l, "REJECTED")}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
