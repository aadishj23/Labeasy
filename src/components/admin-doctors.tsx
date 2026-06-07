"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Trash2, Pencil, Stethoscope } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPECIALTIES } from "@/lib/doctor-suggestions";

const EMPTY = {
  name: "",
  specialty: "",
  pincode: "",
  city: "",
  clinic: "",
  phone: "",
  consult_url: "",
  fee: "",
  blurb: "",
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/doctors");
      if (res.ok) setDoctors((await res.json()).doctors || []);
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

  const startEdit = (d: any) => {
    setEditingId(d.id);
    setForm({
      name: d.name || "",
      specialty: d.specialty || "",
      pincode: d.pincode || "",
      city: d.city || "",
      clinic: d.clinic || "",
      phone: d.phone || "",
      consult_url: d.consult_url || "",
      fee: d.fee != null ? String(d.fee) : "",
      blurb: d.blurb || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    if (!form.name.trim() || !form.specialty.trim() || !form.pincode.trim()) {
      alert("Name, specialty and pincode are required.");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      alert("Pincode must be 6 digits.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, fee: form.fee ? Number(form.fee) : null };
      const res = editingId
        ? await adminFetch(`/api/v1/admin/doctors/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await adminFetch("/api/v1/admin/doctors", {
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

  const toggle = async (d: any) => {
    await adminFetch(`/api/v1/admin/doctors/${d.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !d.active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this doctor?")) return;
    await adminFetch(`/api/v1/admin/doctors/${id}`, { method: "DELETE" });
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
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="h-5 w-5 text-primary" />
          {editingId ? "Edit doctor" : "Add doctor"}
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
            list="specialties"
            placeholder="Specialty *"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />
          <datalist id="specialties">
            {SPECIALTIES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <input
            className={input}
            inputMode="numeric"
            maxLength={6}
            placeholder="Pincode *"
            value={form.pincode}
            onChange={(e) =>
              setForm({
                ...form,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
          />
          <input
            className={input}
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className={input}
            placeholder="Clinic / hospital"
            value={form.clinic}
            onChange={(e) => setForm({ ...form, clinic: e.target.value })}
          />
          <input
            className={input}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="number"
            min={0}
            className={input}
            placeholder="Consult fee (₹)"
            value={form.fee}
            onChange={(e) => setForm({ ...form, fee: e.target.value })}
          />
          <input
            className={`${input} sm:col-span-2`}
            placeholder="Booking / consult URL"
            value={form.consult_url}
            onChange={(e) => setForm({ ...form, consult_url: e.target.value })}
          />
        </div>
        <textarea
          className="mt-3 min-h-[60px] w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Short blurb"
          value={form.blurb}
          onChange={(e) => setForm({ ...form, blurb: e.target.value })}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="gradient" onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingId ? "Save changes" : "Add doctor"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Doctors ({doctors.length})</h2>
        {doctors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No doctors yet.</p>
        ) : (
          <div className="space-y-3">
            {doctors.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{d.name}</h3>
                    <Badge variant="secondary">{d.specialty}</Badge>
                    <Badge variant={d.active ? "success" : "secondary"}>
                      {d.active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[d.clinic, d.city, d.pincode].filter(Boolean).join(", ") ||
                      "—"}
                    {d.fee != null && ` · ₹${d.fee}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggle(d)}>
                    {d.active ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => startEdit(d)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(d.id)}
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
