"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  FlaskConical,
  Loader2,
  Building2,
  ClipboardCheck,
} from "lucide-react";
import { adminFetch, clearAdminToken, getAdminToken } from "@/lib/admin-client";
import AdminLabQueue from "@/components/admin-lab-queue";
import AdminChangeRequests from "@/components/admin-change-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Test } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [form, setForm] = useState({
    test_name: "",
    test_description: "",
    turnaround_hours: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<Test | null>(null);
  const [tab, setTab] = useState<"tests" | "labs" | "requests">("tests");

  const loadTests = useCallback(async () => {
    const res = await fetch("/api/v1/tests/gettests", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setTests(data.tests || []);
    }
  }, []);

  // Guard: require a valid admin token (sessionStorage) or redirect to login.
  useEffect(() => {
    const check = async () => {
      if (!getAdminToken()) {
        router.replace("/admin/login");
        return;
      }
      const res = await adminFetch("/api/v1/admin/me");
      if (!res.ok) {
        clearAdminToken();
        router.replace("/admin/login");
        return;
      }
      setAuthed(true);
      loadTests();
    };
    check();
  }, [router, loadTests]);

  const handleLogout = () => {
    clearAdminToken();
    router.replace("/admin/login");
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/v1/tests/addtest", {
        method: "POST",
        body: JSON.stringify({
          test_name: form.test_name,
          test_description: form.test_description,
          ...(form.turnaround_hours
            ? { turnaround_hours: Number(form.turnaround_hours) }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Could not add test.");
        return;
      }
      setForm({ test_name: "", test_description: "", turnaround_hours: "" });
      loadTests();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      const res = await adminFetch(`/api/v1/tests/updatetest/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          test_name: editing.test_name,
          test_description: editing.test_description,
          ...(editing.turnaround_hours
            ? { turnaround_hours: Number(editing.turnaround_hours) }
            : {}),
        }),
      });
      if (res.ok) {
        setEditing(null);
        loadTests();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await adminFetch(`/api/v1/tests/deletetest/${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadTests();
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-border bg-card/40 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Admin console
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex gap-2 border-b border-border">
          <button
            onClick={() => setTab("tests")}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === "tests"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FlaskConical className="h-4 w-4" /> Test catalogue
          </button>
          <button
            onClick={() => setTab("labs")}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === "labs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" /> Lab verification
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" /> Change requests
          </button>
        </div>

        {tab === "requests" ? (
          <>
            <h1 className="text-2xl font-bold">Change requests</h1>
            <p className="mt-1 text-muted-foreground">
              Approve or reject lab profile changes to verified details.
            </p>
            <div className="mt-8">
              <AdminChangeRequests />
            </div>
          </>
        ) : tab === "labs" ? (
          <>
            <h1 className="text-2xl font-bold">Lab verification</h1>
            <p className="mt-1 text-muted-foreground">
              Review documents and approve, suspend, or reset labs.
            </p>
            <div className="mt-8">
              <AdminLabQueue />
            </div>
          </>
        ) : (
        <>
        <h1 className="text-2xl font-bold">Test catalogue</h1>
        <p className="mt-1 text-muted-foreground">
          The master list of tests labs can offer.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* Add */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Add a test</h2>
              <form className="mt-5 space-y-4" onSubmit={handleAdd}>
                <div className="space-y-2">
                  <Label htmlFor="test_name">Test name</Label>
                  <Input
                    id="test_name"
                    value={form.test_name}
                    onChange={(e) =>
                      setForm({ ...form, test_name: e.target.value })
                    }
                    placeholder="e.g. Vitamin D"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test_description">Description</Label>
                  <Input
                    id="test_description"
                    value={form.test_description}
                    onChange={(e) =>
                      setForm({ ...form, test_description: e.target.value })
                    }
                    placeholder="Short description"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turnaround_hours">
                    Report turnaround (hours)
                  </Label>
                  <Input
                    id="turnaround_hours"
                    type="number"
                    min={1}
                    value={form.turnaround_hours}
                    onChange={(e) =>
                      setForm({ ...form, turnaround_hours: e.target.value })
                    }
                    placeholder="Default 12"
                  />
                </div>
                {err && <p className="text-sm text-destructive">{err}</p>}
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4" />
                  {submitting ? "Adding..." : "Add test"}
                </Button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              All tests <span className="text-muted-foreground">({tests.length})</span>
            </h2>
            {tests.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <FlaskConical className="h-6 w-6" />
                </span>
                <p className="text-muted-foreground">No tests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tests.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/20 p-4"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium">{t.test_name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {t.test_description}
                      </p>
                      <p className="mt-1 text-xs text-primary">
                        Report in {t.turnaround_hours ?? 12}h
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setEditing(t)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(t.id)}
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
        </>
        )}
      </main>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit test</DialogTitle>
          </DialogHeader>
          {editing && (
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div className="space-y-2">
                <Label htmlFor="edit_name">Test name</Label>
                <Input
                  id="edit_name"
                  value={editing.test_name}
                  onChange={(e) =>
                    setEditing({ ...editing, test_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_desc">Description</Label>
                <Input
                  id="edit_desc"
                  value={editing.test_description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, test_description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_turnaround">
                  Report turnaround (hours)
                </Label>
                <Input
                  id="edit_turnaround"
                  type="number"
                  min={1}
                  value={editing.turnaround_hours ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      turnaround_hours: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Default 12"
                />
              </div>
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
