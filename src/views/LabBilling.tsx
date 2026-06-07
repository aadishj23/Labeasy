"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Receipt } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

const rupee = (paise: number) => `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;

const periodLabel = (p: string) => {
  const [y, m] = p.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const STATUS_VARIANT: Record<string, any> = {
  PENDING: "warning",
  PAID: "success",
  WAIVED: "secondary",
};

export default function LabBilling() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/labs/invoices", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { invoices: [] }))
      .then((d) => setInvoices(d.invoices || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <Link
          href="/labsdashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mb-6 mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Receipt className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Billing</h1>
            <p className="text-muted-foreground">
              Monthly platform fee based on your sales.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">How fees work</p>
          Platform fee is charged only on monthly sales:
          <span className="mt-2 block">
            ₹0–20,000: free · ₹20k–30k: ₹500 · ₹30k–50k: ₹1,000 · above:
            progressive
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
            No invoices yet. They appear after your first month of sales.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Sales (GMV)</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-medium">
                      {periodLabel(inv.period)}
                    </td>
                    <td className="px-4 py-3">{rupee(inv.gmv)}</td>
                    <td className="px-4 py-3 font-semibold">{rupee(inv.fee)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[inv.status]}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
