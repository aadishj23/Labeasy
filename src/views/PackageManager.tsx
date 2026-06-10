"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Loader2,
  Package as PackageIcon,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function PackageManager() {
  const [labTests, setLabTests] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const [testsRes, pkgRes] = await Promise.all([
        axios.post("/api/v1/tests/gettestsforlab"),
        fetch("/api/v1/labs/packages", { cache: "no-store" }).then((r) =>
          r.ok ? r.json() : { packages: [] }
        ),
      ]);
      setLabTests(testsRes.data.tests || []);
      setPackages(pkgRes.packages || []);
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
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", mrp: "" });
    setSelected([]);
    setEditingId(null);
    setErr("");
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      mrp: p.mrp != null ? String(p.mrp) : "",
    });
    setSelected((p.items || []).map((i: any) => i.test_id));
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (selected.length < 2) {
      setErr("Pick at least 2 tests for a package.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : null,
        testIds: selected,
      };
      const res = editingId
        ? await fetch(`/api/v1/labs/packages/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/v1/labs/packages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.message || "Could not save package.");
        return;
      }
      resetForm();
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/v1/labs/packages/${id}`, { method: "DELETE" });
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/v1/labs/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    load();
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
            <PackageIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Packages</h1>
            <p className="text-muted-foreground">
              Bundle your tests into a discounted package.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
            {/* Create */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">{editingId ? "Edit package" : "New package"}</h2>
                <form className="mt-5 space-y-4" onSubmit={save}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Full Body Checkup"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Short description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mrp">MRP (₹, optional)</Label>
                      <Input
                        id="mrp"
                        type="number"
                        value={form.mrp}
                        onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                        placeholder="Strike-through"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Tests in package{" "}
                      <span className="text-muted-foreground">
                        ({selected.length} selected)
                      </span>
                    </Label>
                    {labTests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Add tests to your catalogue first.
                      </p>
                    ) : (
                      <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
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

                  {err && <p className="text-sm text-destructive">{err}</p>}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="gradient"
                      className="flex-1"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : editingId ? (
                        <Pencil className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {submitting ? "Saving…" : editingId ? "Save changes" : "Create package"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="ghost" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Your packages{" "}
                <span className="text-muted-foreground">({packages.length})</span>
              </h2>
              {packages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <PackageIcon className="h-6 w-6" />
                  </span>
                  <p className="text-muted-foreground">No packages yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-border bg-secondary/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{p.name}</h3>
                            {!p.active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {p.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground">{p.description}</p>
                          )}
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            ₹{p.price}
                            {p.mrp ? (
                              <span className="ml-2 line-through">₹{p.mrp}</span>
                            ) : null}{" "}
                            · {p.items?.length ?? 0} tests
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActive(p.id, !p.active)}
                          >
                            {p.active ? "Hide" : "Show"}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9"
                            onClick={() => startEdit(p)}
                            aria-label="Edit package"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(p.id)}
                            aria-label="Delete package"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {p.items?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.items.map((it: any) => (
                            <span
                              key={it.id}
                              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {it.test?.test_name || "Test"}
                            </span>
                          ))}
                        </div>
                      )}
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
