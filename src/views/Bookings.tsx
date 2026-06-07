"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Building2,
  Home,
  Calendar,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_META: Record<string, { label: string; variant: any }> = {
  PLACED: { label: "Awaiting payment", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  SAMPLE_COLLECTED: { label: "Sample collected", variant: "default" },
  PROCESSING: { label: "Processing", variant: "default" },
  REPORT_READY: { label: "Report ready", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

const rupees = (paise: number) => `₹${Math.round(paise / 100)}`;

function Bookings() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/orders/mine", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">My bookings</h1>
            <p className="text-muted-foreground">Track your test orders.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <ClipboardList className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">No bookings yet</h2>
              <p className="mt-1 text-muted-foreground">
                Book a test to see it here.
              </p>
            </div>
            <Button asChild variant="gradient">
              <Link href="/tests">
                Browse tests <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const meta = STATUS_META[order.status] || {
                label: order.status,
                variant: "secondary",
              };
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold">{order.lab?.lab_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
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

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      {order.collection_type === "HOME" ? (
                        <>
                          <Home className="h-4 w-4" /> Home collection
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" /> Lab visit
                        </>
                      )}
                    </span>
                    {order.scheduled_at && (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.scheduled_at).toLocaleString()}
                      </span>
                    )}
                    <span className="text-base font-bold">
                      {rupees(order.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Bookings;
