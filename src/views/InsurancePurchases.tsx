"use client";
import { useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
const rupee = (p: number) => `₹${Math.round(p / 100).toLocaleString("en-IN")}`;
export default function InsurancePurchases() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/v1/insurance/purchases", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { purchases: [] }))
      .then((d) => setRows(d.purchases || [])).finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-background"><Navbar />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><Receipt className="h-5 w-5" /></span>
          <div><h1 className="text-3xl font-bold sm:text-4xl">Policy sales</h1><p className="text-muted-foreground">Plans patients have bought.</p></div>
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          : rows.length === 0 ? <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">No sales yet.</div>
          : <div className="overflow-hidden rounded-2xl border border-border bg-card"><table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/20 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Buyer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">You earned</th></tr></thead>
              <tbody className="divide-y divide-border">{rows.map((r) => (
                <tr key={r.id}><td className="px-4 py-3 font-medium">{r.plan?.name}</td><td className="px-4 py-3 text-muted-foreground">{r.user?.name || "Patient"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-400">{rupee(r.amount - r.commission)}<span className="ml-1 text-xs font-normal text-muted-foreground">of {rupee(r.amount)}</span></td></tr>))}
              </tbody></table></div>}
      </section><Footer /></div>
  );
}
