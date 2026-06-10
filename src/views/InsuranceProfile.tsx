"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InsuranceProfile() {
  const [form, setForm] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () =>
    fetch("/api/v1/insurance/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.company) {
          const { email: e, status, ...rest } = d.company;
          setEmail(e);
          setForm(rest);
          setPending(d.pending || null);
        }
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const onChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/v1/insurance/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) return setMsg(d.message || "Update failed.");
      setMsg(d.pending ? "Submitted — your changes are pending admin approval." : "No changes to submit.");
      load();
    } finally {
      setSaving(false);
    }
  };

  const field =
    "h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Profile</h1>
            <p className="text-muted-foreground">All profile changes need admin approval.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !form ? (
          <p className="text-muted-foreground">Please sign in as an insurer.</p>
        ) : (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            {pending && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                <Clock className="mt-0.5 h-4 w-4 text-amber-300" />
                <span>
                  Pending approval:{" "}
                  {Object.entries(pending.changes || {}).map(([k, v]) => `${k} → ${v}`).join(", ")}
                </span>
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input value={email} disabled className="mt-1" />
            </div>
            <div>
              <Label>Company name</Label>
              <Input name="name" value={form.name || ""} onChange={onChange} className="mt-1" />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input name="logo_url" value={form.logo_url || ""} onChange={onChange} className="mt-1" />
            </div>
            <div>
              <Label>About</Label>
              <textarea name="description" value={form.description || ""} onChange={onChange} className={`${field} mt-1 min-h-[90px] py-2`} />
            </div>
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
            <Button variant="gradient" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
