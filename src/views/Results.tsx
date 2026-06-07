"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Lock,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Loader2,
  FileText,
  AlertTriangle,
  Stethoscope,
  Phone,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { suggestSpecialties } from "@/lib/doctor-suggestions";

type Point = { date: string; value: number };
type Series = {
  name: string;
  unit?: string | null;
  ref_low?: number | null;
  ref_high?: number | null;
  points: Point[];
};

function flagOf(v: number, low?: number | null, high?: number | null) {
  if (low != null && v < low) return "low" as const;
  if (high != null && v > high) return "high" as const;
  if (low != null || high != null) return "normal" as const;
  return null;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 140;
  const h = 40;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="text-primary">
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Results = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const ready = useAuthStore((s) => s.ready);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/v1/reports/mine", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => setReports(d.reports || []))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  // Build per-analyte time series from all reports that have structured results.
  const series = useMemo<Series[]>(() => {
    const map = new Map<string, Series>();
    const sorted = [...reports].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    for (const rep of sorted) {
      const rows = Array.isArray(rep.results)
        ? rep.results
        : rep.results?.analytes;
      if (!Array.isArray(rows)) continue;
      for (const a of rows) {
        const value = Number(a.value);
        if (!Number.isFinite(value)) continue;
        const s =
          map.get(a.name) ||
          ({
            name: a.name,
            unit: a.unit,
            ref_low: a.ref_low,
            ref_high: a.ref_high,
            points: [],
          } as Series);
        s.unit = a.unit ?? s.unit;
        s.ref_low = a.ref_low ?? s.ref_low;
        s.ref_high = a.ref_high ?? s.ref_high;
        s.points.push({ date: rep.created_at, value });
        map.set(a.name, s);
      }
    }
    return [...map.values()];
  }, [reports]);

  const abnormal = series.filter((s) => {
    const last = s.points[s.points.length - 1];
    const f = flagOf(last.value, s.ref_low, s.ref_high);
    return f === "low" || f === "high";
  });

  // Recommend specialists based on the abnormal analytes.
  const abnormalKey = abnormal.map((s) => s.name).join("|");
  useEffect(() => {
    const names = abnormalKey ? abnormalKey.split("|") : [];
    const specs = suggestSpecialties(names);
    if (specs.length === 0) {
      setDoctors([]);
      return;
    }
    fetch(`/api/v1/doctors?specialties=${encodeURIComponent(specs.join(","))}`)
      .then((r) => (r.ok ? r.json() : { doctors: [] }))
      .then((d) => setDoctors(d.doctors || []))
      .catch(() => setDoctors([]));
  }, [abnormalKey]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold">Sign in to view your health data</h1>
          <p className="text-muted-foreground">
            Your results and health trends are private. Please sign in to
            continue.
          </p>
          <Button asChild variant="gradient">
            <Link href="/signinuser">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Health dashboard</h1>
            <p className="text-muted-foreground">
              Trends and flags from your lab results over time.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : series.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Activity className="h-6 w-6" />
            </span>
            <p className="text-muted-foreground">
              No structured results yet. Once a lab enters your results, trends
              show up here.
            </p>
            <Button asChild variant="outline">
              <Link href="/reports">
                <FileText className="h-4 w-4" /> View report PDFs
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {abnormal.length > 0 && (
              <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                <p className="flex items-center gap-2 font-semibold text-amber-300">
                  <AlertTriangle className="h-4 w-4" /> Needs attention
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {abnormal.map((s) => {
                    const last = s.points[s.points.length - 1];
                    const f = flagOf(last.value, s.ref_low, s.ref_high);
                    return (
                      <span
                        key={s.name}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
                      >
                        <span className="font-medium">{s.name}</span>{" "}
                        <span
                          className={
                            f === "high" ? "text-red-400" : "text-sky-400"
                          }
                        >
                          {last.value}
                          {s.unit ? ` ${s.unit}` : ""} ({f})
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {abnormal.length > 0 && doctors.length > 0 && (
              <div className="mb-8 rounded-2xl border border-border bg-card p-5">
                <p className="flex items-center gap-2 font-semibold">
                  <Stethoscope className="h-4 w-4 text-primary" /> Recommended
                  specialists
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Based on your flagged results. Always consult a doctor before
                  acting on lab values.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-col rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium">{d.name}</h3>
                        {d.fee != null && (
                          <span className="text-xs text-muted-foreground">
                            ₹{d.fee}
                          </span>
                        )}
                      </div>
                      <Badge variant="secondary" className="mt-1 w-fit">
                        {d.specialty}
                      </Badge>
                      {(d.clinic || d.city || d.pincode) && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[d.clinic, d.city, d.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {d.blurb && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {d.blurb}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        {d.consult_url && (
                          <a
                            href={d.consult_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/25"
                          >
                            Book <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {d.phone && (
                          <a
                            href={`tel:${d.phone}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary/40"
                          >
                            <Phone className="h-3 w-3" /> Call
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {series.map((s) => {
                const last = s.points[s.points.length - 1];
                const prev = s.points[s.points.length - 2];
                const f = flagOf(last.value, s.ref_low, s.ref_high);
                const trend = prev
                  ? last.value > prev.value
                    ? "up"
                    : last.value < prev.value
                      ? "down"
                      : "flat"
                  : null;
                const range =
                  s.ref_low != null || s.ref_high != null
                    ? `Ref: ${s.ref_low ?? "—"}–${s.ref_high ?? "—"}${
                        s.unit ? ` ${s.unit}` : ""
                      }`
                    : null;
                return (
                  <div
                    key={s.name}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-snug">{s.name}</h3>
                      {f && (
                        <Badge
                          variant={
                            f === "normal"
                              ? "success"
                              : f === "high"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {f}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold">{last.value}</span>
                      {s.unit && (
                        <span className="pb-1 text-sm text-muted-foreground">
                          {s.unit}
                        </span>
                      )}
                      {trend && trend !== "flat" && (
                        <span className="pb-1">
                          {trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                      )}
                      {trend === "flat" && (
                        <Minus className="mb-1.5 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {range && (
                      <p className="mt-1 text-xs text-muted-foreground">{range}</p>
                    )}
                    <div className="mt-3">
                      <Sparkline values={s.points.map((p) => p.value)} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.points.length} reading
                      {s.points.length > 1 ? "s" : ""} · latest{" "}
                      {new Date(last.date).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/reports">
                  <FileText className="h-4 w-4" /> View report PDFs
                </Link>
              </Button>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Results;
