"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Chart from "chart.js/auto";
import {
  Loader2,
  ArrowLeft,
  IndianRupee,
  CalendarClock,
  ClipboardList,
  CheckCircle2,
  Activity,
  XCircle,
  Star,
  Receipt,
  FlaskConical,
  BarChart3,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function LabAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [included, setIncluded] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch("/api/v1/labs/analytics", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current) return;
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
            label: "Revenue (₹)",
            data: data.monthly.map((m: any) => m.revenue),
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
          x: {
            grid: { display: false },
            ticks: { color: "rgba(226,232,240,0.7)" },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [data]);

  const s = data?.summary;

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
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Analytics</h1>
            <p className="text-muted-foreground">
              Your bookings, revenue, and platform fee.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !s ? (
          <p className="text-muted-foreground">Please sign in as a lab.</p>
        ) : (
          <>
            <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={included}
                onChange={(e) => setIncluded(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Include off-platform (manual) orders
            </label>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                icon={IndianRupee}
                label="Total revenue"
                value={rupee(s.gmvTotal + (included ? s.offPlatformGmv || 0 : 0))}
                hint={included ? "incl. off-platform" : undefined}
              />
              <Stat
                icon={CalendarClock}
                label="This month"
                value={rupee(s.gmvMonth)}
              />
              <Stat
                icon={ClipboardList}
                label="Bookings"
                value={String(s.bookings + (included ? s.offPlatformOrders || 0 : 0))}
                hint={included ? "incl. off-platform" : undefined}
              />
              <Stat
                icon={Receipt}
                label="Platform fee (mo)"
                value={rupee(s.platformFee)}
                hint="Based on this month's GMV"
              />
              <Stat
                icon={Activity}
                label="Active"
                value={String(s.active)}
              />
              <Stat
                icon={CheckCircle2}
                label="Completed"
                value={String(s.completed)}
              />
              <Stat
                icon={XCircle}
                label="Cancelled"
                value={String(s.cancelled)}
              />
              <Stat
                icon={Star}
                label="Rating"
                value={s.ratingCount ? `${s.ratingAvg.toFixed(1)}★` : "—"}
                hint={s.ratingCount ? `${s.ratingCount} reviews` : "No reviews yet"}
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Revenue — last 6 months</h2>
                <div className="h-[280px]">
                  <canvas ref={chartRef} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Top tests</h2>
                {data.topTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No bookings yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.topTests.map((t: any, i: number) => (
                      <li
                        key={t.name}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                            {i + 1}
                          </span>
                          <FlaskConical className="h-4 w-4 text-muted-foreground" />
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
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
