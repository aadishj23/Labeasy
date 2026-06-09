"use client";

import { useEffect, useState } from "react";
import { Loader2, ClipboardList, Check, X } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, any> = {
  CONFIRMED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function DoctorAppointments() {
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch("/api/v1/doctor/appointments", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { appointments: [] }))
      .then((d) => setAppts(d.appointments || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/v1/doctor/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Appointments</h1>
            <p className="text-muted-foreground">
              Mark consultations completed to get paid.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : appts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
            No appointments yet.
          </div>
        ) : (
          <div className="space-y-3">
            {appts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {a.user?.name || a.patient_name || "Patient"}
                    </h3>
                    <Badge variant={STATUS_VARIANT[a.status] || "secondary"}>{a.status}</Badge>
                    {a.source === "MANUAL" && <Badge variant="secondary">Manual</Badge>}
                    {a.source === "MANUAL" && a.paid_status && (
                      <Badge
                        variant={
                          a.paid_status === "PAID"
                            ? "success"
                            : a.paid_status === "PARTIAL"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {a.paid_status === "PARTIAL"
                          ? `Partial ₹${Math.round(a.amount_paid / 100)}/${Math.round(a.fee / 100)}`
                          : a.paid_status === "PAID"
                            ? "Paid"
                            : "Unpaid"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(a.scheduled_at).toLocaleString()}
                    {a.fee > 0 ? ` · ₹${Math.round(a.fee / 100)}` : ""}
                    {(a.user?.phone || a.patient_phone)
                      ? ` · ${a.user?.phone || a.patient_phone}`
                      : ""}
                  </p>
                </div>
                {a.status === "CONFIRMED" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="gradient" onClick={() => setStatus(a.id, "COMPLETED")}>
                      <Check className="h-4 w-4" /> Complete
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setStatus(a.id, "CANCELLED")}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
