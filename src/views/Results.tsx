"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Chart from "chart.js/auto";
import { Lock, ExternalLink, FileText, TrendingUp, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const REPORTS = [
  {
    name: "Liver Function Test",
    link: "https://drive.google.com/file/d/1Mgccp4JaQAR0VKQGhjjdxdPb7W9Nwo3R/view?usp=sharing",
    date: "15 Jun 2024",
  },
  {
    name: "Leucocytes Test",
    link: "https://drive.google.com/file/d/1AEeJK8IylqJ0_Eq2cVW_bVIvbIeOvg40/view?usp=sharing",
    date: "10 Aug 2024",
  },
  {
    name: "Complete Haemogram Test",
    link: "https://drive.google.com/file/d/1YUdWe27UtC0kSgZrKMNyWL_4hqGcABJn/view?usp=sharing",
    date: "05 Oct 2024",
  },
];

const Results = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const ready = useAuthStore((s) => s.ready);
  const chartRef = useRef<HTMLCanvasElement>(null);

  const generateData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];
    let value = 77.5;
    for (let i = 11; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 2;
      value = Math.max(75, Math.min(80, value + variation));
      data.unshift({ x: months[i], y: Math.round(value * 10) / 10 });
    }
    data.push({ x: "Current", y: 77.5 });
    return data;
  };

  useEffect(() => {
    if (!isLoggedIn || !chartRef.current) return;
    const accent = "#22d3ee";
    const grid = "rgba(148, 163, 184, 0.12)";
    const text = "rgba(226, 232, 240, 0.8)";
    const ctx = chartRef.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, "rgba(34, 211, 238, 0.35)");
    gradient.addColorStop(1, "rgba(34, 211, 238, 0)");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "H-Factor",
            data: generateData(),
            borderColor: accent,
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: accent,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "H-Factor trend — past year",
            color: text,
            font: { size: 15, weight: 600 },
            padding: { bottom: 16 },
          },
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: false, grid: { color: grid }, ticks: { color: text } },
          x: { grid: { color: grid }, ticks: { color: text } },
        },
      },
    });
    return () => chart.destroy();
  }, [isLoggedIn]);

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
          <h1 className="text-2xl font-bold">Sign in to view results</h1>
          <p className="text-muted-foreground">
            Your test reports and health trends are private. Please sign in to
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
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Results</h1>
            <p className="text-muted-foreground">
              Track your health trends and access your reports.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="h-[320px]">
            <canvas ref={chartRef} />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Your reports</h2>
          <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-border pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Test name</span>
            <span className="w-32 text-center">Report</span>
            <span className="w-28 text-right">Date</span>
          </div>
          <div className="divide-y divide-border">
            {REPORTS.map((report) => (
              <div
                key={report.name}
                className="flex flex-col gap-3 py-4 sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{report.name}</span>
                </div>
                <div className="sm:w-32 sm:text-center">
                  <a
                    href={report.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View report
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="sm:w-28 sm:text-right">
                  <Badge variant="secondary">{report.date}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Results;
