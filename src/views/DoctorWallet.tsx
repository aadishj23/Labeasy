"use client";

import { useEffect, useState } from "react";
import { Loader2, Wallet, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

const rupee = (paise: number) =>
  `₹${Math.abs(Math.round(paise / 100)).toLocaleString("en-IN")}`;

const TYPE_LABEL: Record<string, string> = {
  ORDER_EARNING: "Consultation earnings",
  PLATFORM_FEE: "Platform fee",
  PAYOUT: "Settlement payout",
  ADJUSTMENT: "Adjustment",
};

export default function DoctorWallet() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/doctor/wallet", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const balance = data?.balance ?? 0;
  const owed = balance >= 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Wallet</h1>
            <p className="text-muted-foreground">Your consultation earnings.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !data ? (
          <p className="text-muted-foreground">Please sign in as a doctor.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {owed ? "Balance (owed to you)" : "Outstanding"}
                </p>
                <p className={`mt-2 text-3xl font-bold ${owed ? "text-emerald-400" : "text-destructive"}`}>
                  {rupee(balance)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Pending
                </p>
                <p className="mt-2 text-3xl font-bold">{rupee(data.pending)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  From confirmed consults — credited once completed.
                </p>
              </div>
            </div>

            <h2 className="mb-3 mt-8 text-lg font-semibold">Transactions</h2>
            {data.entries.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-12 text-center text-muted-foreground">
                No transactions yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {data.entries.map((e: any) => (
                      <tr key={e.id}>
                        <td className="px-4 py-3">
                          <Badge variant={e.amount >= 0 ? "success" : "secondary"}>
                            {TYPE_LABEL[e.type] || e.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{e.description || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${e.amount >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                          {e.amount >= 0 ? "+" : "−"}{rupee(e.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
