"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  Loader2,
  IndianRupee,
  CalendarClock,
  Wallet,
  Building2,
  Users,
  ClipboardList,
  TrendingUp,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-client";

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vertical, setVertical] = useState<"all" | "lab" | "doctor" | "insurance">("all");
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    adminFetch("/api/v1/admin/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current) return;
    const seriesKey = vertical === "all" ? "gmv" : vertical;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, "rgba(34, 211, 238, 0.55)");
    gradient.addColorStop(1, "rgba(34, 211, 238, 0.05)");
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.monthly.map((m: any) => m.label),
        datasets: [
          {
            label: "GMV (₹)",
            data: data.monthly.map((m: any) => m[seriesKey] ?? 0),
            backgroundColor: gradient,
            borderColor: "#22d3ee",
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(148,163,184,0.12)" },
            ticks: { color: "rgba(226,232,240,0.7)" },
          },
          x: { grid: { display: false }, ticks: { color: "rgba(226,232,240,0.7)" } },
        },
      },
    });
    return () => chart.destroy();
  }, [data, vertical]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!data) return <p className="text-muted-foreground">No data.</p>;

  const s = data.summary;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={IndianRupee}
          label="Total GMV"
          value={rupee(s.gmvTotal)}
          hint={`Labs ${rupee(s.labGmv ?? 0)} · Consults ${rupee(s.consultGmv ?? 0)} · Policies ${rupee(s.insuranceGmv ?? 0)}`}
        />
        <Stat icon={CalendarClock} label="GMV this month" value={rupee(s.gmvMonth)} />
        <Stat
          icon={TrendingUp}
          label="Platform revenue"
          value={rupee(s.platformRevenue)}
          hint={`Fees ${rupee(s.platformFees)} · Ads ${rupee(s.sponsorRevenue)} · Ins. ${rupee(s.insuranceCommission)}`}
        />
        <Stat
          icon={Wallet}
          label="Owed to labs"
          value={rupee(s.owedToLabs)}
          hint="Unsettled balances"
        />
        <Stat
          icon={Building2}
          label="Vendors"
          value={`${s.labs}/${s.doctors ?? 0}/${s.insurers ?? 0}`}
          hint="labs / doctors / insurers"
        />
        <Stat icon={Users} label="Patients" value={String(s.patients)} />
        <Stat
          icon={ClipboardList}
          label="Lab bookings"
          value={String(s.bookings)}
          hint={`${s.completed} completed`}
        />
        <Stat
          icon={Stethoscope}
          label="Consults"
          value={String(s.consults ?? 0)}
          hint={`${rupee(s.consultGmv ?? 0)} GMV`}
        />
        <Stat
          icon={ShieldCheck}
          label="Policies sold"
          value={String(s.policies ?? 0)}
          hint={`${rupee(s.insuranceGmv ?? 0)} GMV`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Bookings & GMV — last 6 months</h2>
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: "all", label: "All" },
                { v: "lab", label: "Labs" },
                { v: "doctor", label: "Doctors" },
                { v: "insurance", label: "Insurance" },
              ].map((t) => (
                <button
                  key={t.v}
                  onClick={() => setVertical(t.v as any)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    vertical === t.v
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 flex gap-6 text-sm">
            <span><span className="text-muted-foreground">Bookings: </span><span className="font-semibold">{data.byType?.[vertical]?.bookings ?? 0}</span></span>
            <span><span className="text-muted-foreground">GMV: </span><span className="font-semibold">{rupee(data.byType?.[vertical]?.gmv ?? 0)}</span></span>
          </div>
          <div className="h-[280px]">
            <canvas ref={chartRef} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Top labs</h2>
            {data.topLabs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.topLabs.map((l: any, i: number) => (
                  <li key={l.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      {l.name}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {rupee(l.gmv)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Top tests</h2>
            {data.topTests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.topTests.map((t: any, i: number) => (
                  <li key={t.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      {t.name}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
