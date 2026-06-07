"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ClipboardList,
  User,
  Phone,
  Home,
  Building2,
  Calendar,
  LayoutGrid,
  Upload,
  FileText,
  ExternalLink,
  ListPlus,
  Plus,
  X,
  Check,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Awaiting payment",
  CONFIRMED: "Confirmed",
  SAMPLE_COLLECTED: "Sample collected",
  PROCESSING: "Processing",
  REPORT_READY: "Report ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

// Progress stages shown in the stepper. COMPLETED is reached only by uploading
// a report; the lab manually advances through the first three.
const STEPS = ["CONFIRMED", "SAMPLE_COLLECTED", "PROCESSING", "COMPLETED"];
const MANUAL_NEXT: Record<string, string> = {
  CONFIRMED: "SAMPLE_COLLECTED",
  SAMPLE_COLLECTED: "PROCESSING",
};
const TERMINAL = ["COMPLETED", "CANCELLED", "REFUNDED"];

function stepIndex(status: string) {
  if (status === "REPORT_READY") return 2; // legacy orders -> show as processing done
  const i = STEPS.indexOf(status);
  return i === -1 ? 0 : i;
}

const rupees = (paise: number) => `₹${Math.round(paise / 100)}`;

function LabBookings() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // structured results entry
  const emptyRow = { name: "", value: "", unit: "", ref_low: "", ref_high: "" };
  const [resultsOrder, setResultsOrder] = useState<any | null>(null);
  const [rows, setRows] = useState<any[]>([{ ...emptyRow }]);
  const [savingResults, setSavingResults] = useState(false);

  // cancel flow (remark required)
  const [cancelOrder, setCancelOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);

  const load = () => {
    fetch("/api/v1/orders/lab", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  };

  const uploadReport = async (orderId: string, file: File) => {
    setUploadingId(orderId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("orderId", orderId);
      const res = await fetch("/api/v1/labs/reports", {
        method: "POST",
        body: fd,
      });
      if (res.ok) load();
    } finally {
      setUploadingId(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openResults = (order: any) => {
    setRows([{ ...emptyRow }]);
    setResultsOrder(order);
  };

  const saveResults = async () => {
    if (!resultsOrder) return;
    setSavingResults(true);
    try {
      const res = await fetch("/api/v1/labs/reports/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: resultsOrder.id, results: rows }),
      });
      if (res.ok) {
        setResultsOrder(null);
        load();
      }
    } finally {
      setSavingResults(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelOrder || !cancelReason.trim()) return;
    setCancelBusy(true);
    try {
      const res = await fetch(`/api/v1/orders/${cancelOrder.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", reason: cancelReason.trim() }),
      });
      if (res.ok) {
        setCancelOrder(null);
        setCancelReason("");
        load();
      }
    } finally {
      setCancelBusy(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    const res = await fetch(`/api/v1/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) load(); // revert optimistic update on rejection
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">Bookings</h1>
              <p className="text-muted-foreground">Incoming test orders.</p>
            </div>
          </div>
          <Link
            href="/labsdashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LayoutGrid className="h-4 w-4" />
            Catalogue
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <ClipboardList className="h-6 w-6" />
            </span>
            <p className="text-muted-foreground">No bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <User className="h-4 w-4 text-primary" />
                      {order.user?.name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {order.user?.phone}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {order.collection_type === "HOME" ? (
                          <>
                            <Home className="h-3.5 w-3.5" /> Home
                          </>
                        ) : (
                          <>
                            <Building2 className="h-3.5 w-3.5" /> Lab visit
                          </>
                        )}
                      </span>
                      {order.scheduled_at && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(order.scheduled_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold">{rupees(order.total)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {order.items.map((it: any) => (
                    <span
                      key={it.id}
                      className="rounded-lg bg-secondary/40 px-2.5 py-1 text-sm"
                    >
                      {it.test_name}
                    </span>
                  ))}
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
                    <div>
                      <Badge variant="destructive">
                        {STATUS_LABEL[order.status]}
                      </Badge>
                      {order.cancel_reason && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Reason: {order.cancel_reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start">
                        {STEPS.map((step, i) => {
                          const idx = stepIndex(order.status);
                          const isComplete = order.status === "COMPLETED";
                          const done = i < idx || (isComplete && i === idx);
                          const current = i === idx && !isComplete;
                          const isNext = step === MANUAL_NEXT[order.status];
                          return (
                            <div
                              key={step}
                              className="flex flex-1 flex-col items-center"
                            >
                              <div className="flex w-full items-center">
                                <div
                                  className={`h-0.5 flex-1 ${
                                    i === 0
                                      ? "opacity-0"
                                      : i <= idx
                                        ? "bg-primary"
                                        : "bg-border"
                                  }`}
                                />
                                <button
                                  type="button"
                                  disabled={!isNext}
                                  onClick={() =>
                                    isNext && updateStatus(order.id, step)
                                  }
                                  title={
                                    isNext
                                      ? `Mark ${STATUS_LABEL[step]}`
                                      : undefined
                                  }
                                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                                    done
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : current
                                        ? "border-primary text-primary"
                                        : isNext
                                          ? "cursor-pointer border-dashed border-primary/60 text-primary hover:bg-primary/10"
                                          : "border-border text-muted-foreground"
                                  }`}
                                >
                                  {done ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    i + 1
                                  )}
                                </button>
                                <div
                                  className={`h-0.5 flex-1 ${
                                    i === STEPS.length - 1
                                      ? "opacity-0"
                                      : i < idx
                                        ? "bg-primary"
                                        : "bg-border"
                                  }`}
                                />
                              </div>
                              <span
                                className={`mt-1.5 text-center text-[11px] leading-tight ${
                                  current
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {STATUS_LABEL[step]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {order.status === "PROCESSING" && (
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                          Upload a report below to complete this booking.
                        </p>
                      )}

                      {order.status !== "COMPLETED" && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setCancelReason("");
                              setCancelOrder(order);
                            }}
                          >
                            <X className="h-4 w-4" /> Cancel booking
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {order.status !== "CANCELLED" &&
                order.status !== "REFUNDED" ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Reports:</span>
                  {order.reports?.map((r: any, i: number) => (
                    <a
                      key={r.id}
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/30 px-2.5 py-1 text-sm hover:border-primary/40"
                    >
                      <FileText className="h-3.5 w-3.5 text-primary" /> Report{" "}
                      {(order.reports.length > 1 ? i + 1 : "") as any}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ))}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                    {uploadingId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload report
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      className="hidden"
                      disabled={uploadingId === order.id}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadReport(order.id, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    onClick={() => openResults(order)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <ListPlus className="h-4 w-4" /> Enter results
                  </button>
                </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Structured results entry */}
      <Dialog
        open={!!resultsOrder}
        onOpenChange={(o) => !o && setResultsOrder(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enter results</DialogTitle>
            <DialogDescription>
              Add analyte values — these power the patient&apos;s health trends.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="hidden gap-2 px-2 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.7fr_auto]">
              <span>Analyte</span>
              <span>Value</span>
              <span>Unit</span>
              <span>Ref low</span>
              <span>Ref high</span>
              <span />
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto px-2 py-2">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.7fr_auto]"
                >
                  <Input
                    placeholder="Hemoglobin"
                    value={row.name}
                    onChange={(e) =>
                      setRows((rs) =>
                        rs.map((r, j) =>
                          j === i ? { ...r, name: e.target.value } : r
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="13.5"
                    value={row.value}
                    onChange={(e) =>
                      setRows((rs) =>
                        rs.map((r, j) =>
                          j === i ? { ...r, value: e.target.value } : r
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="g/dL"
                    value={row.unit}
                    onChange={(e) =>
                      setRows((rs) =>
                        rs.map((r, j) =>
                          j === i ? { ...r, unit: e.target.value } : r
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="13"
                    value={row.ref_low}
                    onChange={(e) =>
                      setRows((rs) =>
                        rs.map((r, j) =>
                          j === i ? { ...r, ref_low: e.target.value } : r
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="17"
                    value={row.ref_high}
                    onChange={(e) =>
                      setRows((rs) =>
                        rs.map((r, j) =>
                          j === i ? { ...r, ref_high: e.target.value } : r
                        )
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setRows((rs) =>
                        rs.length > 1 ? rs.filter((_, j) => j !== i) : rs
                      )
                    }
                    aria-label="Remove row"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setRows((rs) => [...rs, { ...emptyRow }])}
            >
              <Plus className="h-4 w-4" /> Add row
            </Button>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResultsOrder(null)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={saveResults}
              disabled={savingResults}
            >
              {savingResults ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save results"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel booking (remark required) */}
      <Dialog
        open={!!cancelOrder}
        onOpenChange={(o) => !o && setCancelOrder(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              Add a reason — it will be shown to the patient.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="e.g. Test temporarily unavailable, sample requirements not met…"
            className="flex w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelOrder(null)}>
              Keep booking
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={confirmCancel}
              disabled={cancelBusy || !cancelReason.trim()}
            >
              {cancelBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cancel booking"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default LabBookings;
