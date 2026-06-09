"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function InsuranceDashboard() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/insurance/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCompany(d?.company || null))
      .finally(() => setLoading(false));
  }, []);

  const status = company?.status;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Insurer dashboard</h1>
            <p className="text-muted-foreground">
              {company ? `Welcome, ${company.name}` : "Manage your plans"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !company ? (
          <p className="text-muted-foreground">Please sign in as an insurer.</p>
        ) : (
          <>
            {status === "PENDING" && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                <Clock className="mt-0.5 h-5 w-5 text-amber-300" />
                <div>
                  <p className="font-semibold text-amber-300">Pending approval</p>
                  <p className="text-sm text-muted-foreground">
                    Your company is under review. Your plans go live once an admin
                    approves your license.
                  </p>
                </div>
              </div>
            )}
            {status === "REJECTED" && (
              <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
                <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Not approved</p>
                  <p className="text-sm text-muted-foreground">
                    Please contact support for details.
                  </p>
                </div>
              </div>
            )}
            {status === "APPROVED" && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-400">Approved</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re live. Plans, purchases, leads, wallet, and
                    analytics arrive in the next release.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Plans listed</p>
                <p className="mt-1 text-2xl font-bold">{company._count?.plans ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Leads</p>
                <p className="mt-1 text-2xl font-bold">{company._count?.leads ?? 0}</p>
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
