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
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const STATUS_OPTIONS = [
  "CONFIRMED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "REPORT_READY",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  SAMPLE_COLLECTED: "Sample collected",
  PROCESSING: "Processing",
  REPORT_READY: "Report ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const rupees = (paise: number) => `₹${Math.round(paise / 100)}`;

function LabBookings() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/v1/orders/lab", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    await fetch(`/api/v1/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
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

                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <label className="text-sm text-muted-foreground">Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="h-9 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default LabBookings;
