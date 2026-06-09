"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Loader2, BarChart3 } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

type StatCfg = { key: string; label: string; money?: boolean; hint?: string };

export default function VendorAnalytics({
  endpoint,
  title,
  stats,
  chartLabel,
  includeToggle,
}: {
  endpoint: string;
  title: string;
  stats: StatCfg[];
  chartLabel: string;
  // Optional checkbox that, when on, adds summary[add[key]] into stat `key`.
  includeToggle?: { label: string; add: Record<string, string> };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [included, setIncluded] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch(endpoint, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => {
    if (!data?.monthly || !chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 0, 260);
    grad.addColorStop(0, "rgba(34,211,238,0.55)");
    grad.addColorStop(1, "rgba(34,211,238,0.05)");
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.monthly.map((m: any) => m.label),
        datasets: [{ label: chartLabel, data: data.monthly.map((m: any) => m.value), backgroundColor: grad, borderColor: "#22d3ee", borderWidth: 1.5, borderRadius: 6, maxBarThickness: 48 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.12)" }, ticks: { color: "rgba(226,232,240,0.7)" } }, x: { grid: { display: false }, ticks: { color: "rgba(226,232,240,0.7)" } } },
      },
    });
    return () => chart.destroy();
  }, [data, chartLabel]);

  const rupee = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="text-muted-foreground">Your performance at a glance.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !data ? (
          <p className="text-muted-foreground">Please sign in.</p>
        ) : (
          <>
            {includeToggle && (
              <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={included}
                  onChange={(e) => setIncluded(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                {includeToggle.label}
              </label>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((s) => {
                const extraKey = included ? includeToggle?.add[s.key] : undefined;
                const value = (data.summary[s.key] || 0) + (extraKey ? data.summary[extraKey] || 0 : 0);
                return (
                  <div key={s.key} className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                    <p className="mt-2 text-2xl font-bold">{s.money ? rupee(value) : value}</p>
                    {s.hint && <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>}
                    {extraKey && (
                      <p className="mt-0.5 text-xs text-primary">incl. off-platform</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">{chartLabel} — last 6 months</h2>
              <div className="h-[260px]"><canvas ref={chartRef} /></div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
