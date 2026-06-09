"use client";

import { useEffect, useState } from "react";
import { Loader2, Stethoscope, Clock, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/doctors/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDoctor(d?.doctor || null))
      .finally(() => setLoading(false));
  }, []);

  const status = doctor?.status;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Doctor dashboard</h1>
            <p className="text-muted-foreground">
              {doctor ? `Welcome, ${doctor.name}` : "Manage your practice"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !doctor ? (
          <p className="text-muted-foreground">Please sign in as a doctor.</p>
        ) : (
          <>
            {status === "PENDING" && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                <Clock className="mt-0.5 h-5 w-5 text-amber-300" />
                <div>
                  <p className="font-semibold text-amber-300">Pending approval</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is under review. You&apos;ll be bookable once an
                    admin approves your license.
                  </p>
                </div>
              </div>
            )}
            {status === "REJECTED" && (
              <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
                <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Not approved</p>
                  <p className="text-sm text-muted-foreground">
                    Please contact support for details.
                  </p>
                </div>
              </div>
            )}
            {status === "APPROVED" && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-400">Approved</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re live. Appointments, slots, wallet, and analytics
                    arrive in the next release.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Profile</h2>
                <Badge variant="secondary">{doctor.specialty}</Badge>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Clinic</dt><dd>{doctor.clinic}</dd></div>
                <div><dt className="text-muted-foreground">Location</dt><dd>{[doctor.city, doctor.pincode].filter(Boolean).join(", ")}</dd></div>
                <div><dt className="text-muted-foreground">Phone</dt><dd>{doctor.phone}</dd></div>
                <div><dt className="text-muted-foreground">Consult fee</dt><dd>₹{doctor.fee}</dd></div>
              </dl>
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
