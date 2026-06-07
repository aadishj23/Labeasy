"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Trash2, Megaphone } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DateTimePicker from "@/components/datetime-picker";

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString() : null;

export default function AdminSponsored() {
  const [listings, setListings] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    labId: "",
    testId: "",
    starts_at: "",
    ends_at: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/sponsored");
      if (res.ok) setListings((await res.json()).listings || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    adminFetch("/api/v1/admin/labs?status=VERIFIED")
      .then((r) => (r.ok ? r.json() : { labs: [] }))
      .then((d) => setLabs(d.labs || []));
    fetch("/api/v1/tests/gettests")
      .then((r) => (r.ok ? r.json() : { tests: [] }))
      .then((d) => setTests(d.tests || []))
      .catch(() => {});
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.labId) return;
    setSaving(true);
    try {
      const res = await adminFetch("/api/v1/admin/sponsored", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ labId: "", testId: "", starts_at: "", ends_at: "" });
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string, active: boolean) => {
    await adminFetch(`/api/v1/admin/sponsored/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    });
    load();
  };

  const remove = async (id: string) => {
    await adminFetch(`/api/v1/admin/sponsored/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      {/* Create */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">New sponsorship</h2>
          <form className="mt-5 space-y-4" onSubmit={create}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lab</label>
              <select
                value={form.labId}
                onChange={(e) => setForm({ ...form, labId: e.target.value })}
                required
                className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a lab</option>
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lab_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Placement</label>
              <select
                value={form.testId}
                onChange={(e) => setForm({ ...form, testId: e.target.value })}
                className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Directory-wide (/labs)</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    Test: {t.test_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Starts</label>
                <DateTimePicker
                  value={form.starts_at}
                  onChange={(v) => setForm({ ...form, starts_at: v })}
                  variant="all"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ends</label>
                <DateTimePicker
                  value={form.ends_at}
                  onChange={(v) => setForm({ ...form, ends_at: v })}
                  variant="all"
                  placeholder="Optional"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={saving || !form.labId}
            >
              <Plus className="h-4 w-4" />
              {saving ? "Adding…" : "Add sponsorship"}
            </Button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Sponsorships{" "}
          <span className="text-muted-foreground">({listings.length})</span>
        </h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Megaphone className="h-6 w-6" />
            </span>
            <p className="text-muted-foreground">No sponsorships yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div
                key={l.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/20 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{l.lab?.lab_name}</h3>
                    {!l.active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {l.test_name ? `Test: ${l.test_name}` : "Directory-wide"}
                    {(fmt(l.starts_at) || fmt(l.ends_at)) &&
                      ` · ${fmt(l.starts_at) || "—"} → ${fmt(l.ends_at) || "—"}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggle(l.id, !l.active)}
                  >
                    {l.active ? "Pause" : "Activate"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(l.id)}
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
    </div>
  );
}
