"use client";
import { useEffect, useState } from "react";
import { Loader2, Users, Check, X } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
const V: Record<string, any> = { CLICKED: "secondary", CONVERTED: "success", REJECTED: "destructive" };
export default function InsuranceLeads() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => fetch("/api/v1/insurance/leads", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { leads: [] })).then((d) => setRows(d.leads || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const set = async (id: string, status: string) => {
    await fetch(`/api/v1/insurance/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };
  return (
    <div className="min-h-screen bg-background"><Navbar />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><Users className="h-5 w-5" /></span>
          <div><h1 className="text-3xl font-bold sm:text-4xl">Leads</h1><p className="text-muted-foreground">Patients who showed interest in your plans.</p></div>
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          : rows.length === 0 ? <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">No leads yet.</div>
          : <div className="space-y-3">{rows.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                <div><div className="flex items-center gap-2"><span className="font-medium">{l.user?.name || "Guest"}</span><Badge variant={V[l.status]}>{l.status}</Badge></div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{l.user?.email || "—"} · {new Date(l.created_at).toLocaleDateString()}</p></div>
                {l.status === "CLICKED" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => set(l.id, "CONVERTED")}><Check className="h-4 w-4" /> Converted</Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => set(l.id, "REJECTED")}><X className="h-4 w-4" /> Reject</Button>
                  </div>
                )}</div>))}
            </div>}
      </section><Footer /></div>
  );
}
