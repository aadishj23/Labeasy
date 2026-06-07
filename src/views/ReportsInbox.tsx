"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  FileText,
  Building2,
  Download,
  ClipboardList,
  Share2,
  Copy,
  Check,
  Trash2,
  Activity,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ReportsInbox() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [shareReport, setShareReport] = useState<any | null>(null);
  const [shareToken, setShareToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = () => {
    fetch("/api/v1/reports/mine", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => setReports(d.reports || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openShare = async (report: any) => {
    setCopied(false);
    setShareReport(report);
    if (report.share_token) {
      setShareToken(report.share_token);
      return;
    }
    setShareToken("");
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/reports/${report.id}/share`, {
        method: "POST",
      });
      const d = await res.json();
      if (res.ok) {
        setShareToken(d.token);
        setReports((rs) =>
          rs.map((r) => (r.id === report.id ? { ...r, share_token: d.token } : r))
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!shareReport) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/reports/${shareReport.id}/share`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReports((rs) =>
          rs.map((r) =>
            r.id === shareReport.id ? { ...r, share_token: null } : r
          )
        );
        setShareReport(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const shareUrl =
    typeof window !== "undefined" && shareToken
      ? `${window.location.origin}/shared/report/${shareToken}`
      : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">My reports</h1>
            <p className="text-muted-foreground">
              Download, share, or view trends from your lab reports.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <ClipboardList className="h-6 w-6" />
            </span>
            <p className="text-muted-foreground">
              No reports yet. They&apos;ll appear here once a lab uploads them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const hasResults =
                Array.isArray(r.results) && r.results.length > 0;
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="inline-flex items-center gap-1.5 font-medium">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {r.order?.lab?.lab_name || "Lab"}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {r.order?.items?.map((i: any) => i.test_name).join(", ")}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                        {r.share_token && (
                          <Badge variant="secondary" className="gap-1">
                            <Share2 className="h-3 w-3" /> Shared
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {hasResults && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/results">
                          <Activity className="h-4 w-4" /> Trends
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openShare(r)}>
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                    {r.file_url && (
                      <Button asChild variant="gradient" size="sm">
                        <a
                          href={r.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Share dialog */}
      <Dialog
        open={!!shareReport}
        onOpenChange={(o) => !o && setShareReport(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share report</DialogTitle>
            <DialogDescription>
              Anyone with this link can view this report — no login needed. Revoke
              it anytime.
            </DialogDescription>
          </DialogHeader>

          {busy && !shareToken ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button variant="outline" size="icon" onClick={copy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full text-destructive"
                onClick={revoke}
                disabled={busy}
              >
                <Trash2 className="h-4 w-4" /> Revoke link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
