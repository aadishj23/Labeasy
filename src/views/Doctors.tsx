"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Stethoscope, Search, MapPin, CalendarClock, Star } from "lucide-react";
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
import { useAuthStore } from "@/store/useAuthStore";
import { SPECIALTIES } from "@/lib/doctor-suggestions";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [prefTime, setPrefTime] = useState("");
  const [pin, setPin] = useState("");
  const [allAreas, setAllAreas] = useState(false);
  const [shownPin, setShownPin] = useState<string | null>(null);
  const [active, setActive] = useState<any>(null); // doctor in popup
  const [detail, setDetail] = useState<any>(null); // { doctor, slots }
  const [detailLoading, setDetailLoading] = useState(false);
  const [booking, setBooking] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState<{ discount: number; final: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [availCoupons, setAvailCoupons] = useState<any[]>([]);
  const [applying, setApplying] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userType = useAuthStore((s) => s.type);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (specialty) p.set("specialty", specialty);
    if (prefTime) p.set("time", prefTime);
    if (pin.trim()) p.set("pincode", pin.trim());
    if (allAreas) p.set("all", "1");
    return fetch(`/api/v1/doctors/browse?${p.toString()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { doctors: [], pincode: null }))
      .then((d) => {
        setDoctors(d.doctors || []);
        setShownPin(d.pincode);
      })
      .finally(() => setLoading(false));
  };

  // Re-fetch on dropdown/toggle changes; text fields apply on Enter/button.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [specialty, prefTime, allAreas]);

  const applyCoupon = async (codeArg?: string) => {
    const code = (codeArg ?? coupon).trim();
    if (!active || !code) return;
    if (codeArg) setCoupon(codeArg);
    setApplying(true);
    setCouponMsg("");
    setCouponInfo(null);
    try {
      const res = await fetch("/api/v1/coupons/validate-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerType: "DOCTOR", ownerId: active.id, code, amount: Math.round((active.fee || 0) * 100) }),
      });
      const d = await res.json();
      if (d.valid) setCouponInfo({ discount: d.discount, final: d.final });
      else setCouponMsg(d.message || "Invalid coupon.");
    } finally {
      setApplying(false);
    }
  };

  const openDoctor = async (d: any) => {
    setActive(d);
    setDetail(null);
    setCoupon("");
    setCouponInfo(null);
    setCouponMsg("");
    setAvailCoupons([]);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/doctors/${d.id}`, { cache: "no-store" });
      setDetail(res.ok ? await res.json() : null);
      fetch(`/api/v1/coupons/available?ownerType=DOCTOR&ownerId=${d.id}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { coupons: [] }))
        .then((j) => setAvailCoupons(j.coupons || []));
    } finally {
      setDetailLoading(false);
    }
  };

  const book = async (slot: any) => {
    if (!isLoggedIn || userType !== "user") {
      toast.error("Please sign in as a patient to book.");
      return;
    }
    setBooking(slot.id);
    try {
      const res = await fetch("/api/v1/appointments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id, couponCode: coupon.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not start booking.");
        return;
      }
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Could not load payment gateway.");
        return;
      }
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "Labeasy — Consultation",
        theme: { color: "#22d3ee" },
        handler: async (resp: any) => {
          const v = await fetch("/api/v1/appointments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentId: data.appointmentId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (v.ok) {
            toast.success("Appointment booked!");
            setActive(null);
          } else {
            toast.error("Payment could not be verified.");
          }
        },
        modal: { ondismiss: () => toast.info("Booking cancelled.") },
      });
      // Close the Radix dialog first so its pointer-events lock is gone before
      // Razorpay mounts (otherwise the payment iframe is non-interactive).
      setActive(null);
      setBooking("");
      setTimeout(() => rzp.open(), 300);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBooking("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Find a doctor</h1>
            <p className="text-muted-foreground">
              Book a consultation with verified specialists.
            </p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Search name / specialty / city"
              className="h-11 w-full rounded-xl border border-input bg-secondary/40 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="h-11 rounded-xl border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            value={pin}
            disabled={allAreas}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Pincode"
            className="h-11 w-28 rounded-xl border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <select
            value={prefTime}
            onChange={(e) => setPrefTime(e.target.value)}
            className="h-11 rounded-xl border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Any time</option>
            <option value="morning">Morning (before 12 PM)</option>
            <option value="afternoon">Afternoon (12–5 PM)</option>
            <option value="evening">Evening (after 5 PM)</option>
          </select>
          <Button variant="outline" className="h-11" onClick={() => load()}>Apply</Button>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          {allAreas
            ? "Showing doctors everywhere."
            : shownPin
              ? <>Showing doctors near <span className="font-medium text-foreground">{shownPin}</span>.{" "}
                  <button className="text-primary hover:underline" onClick={() => { setPin(""); setAllAreas(true); }}>Show all areas</button></>
              : <>Showing all doctors. {" "}
                  <span className="text-xs">Add a default address to see ones near you.</span></>}
          {allAreas && (
            <>{" "}<button className="text-primary hover:underline" onClick={() => setAllAreas(false)}>Near me</button></>
          )}
        </p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : doctors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
            No doctors found.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => (
              <button
                key={d.id}
                onClick={() => openDoctor(d)}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-glow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{d.name}</h3>
                  {d.fee != null && <span className="text-sm text-muted-foreground">₹{d.fee}</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {d.featured && <Badge variant="default">Featured</Badge>}
                  <Badge variant="secondary" className="w-fit">{d.specialty}</Badge>
                  {d.rating_count > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-amber-400">
                      <Star className="h-3 w-3 fill-current" /> {d.rating_avg}
                      <span className="text-muted-foreground">({d.rating_count})</span>
                    </span>
                  )}
                </div>
                {(d.clinic || d.city) && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />{[d.clinic, d.city, d.pincode].filter(Boolean).join(", ")}
                  </p>
                )}
                {d.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>}
                <span className="mt-4 text-sm font-medium text-primary">View & book →</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Doctor detail + slots */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" /> {active?.name}
            </DialogTitle>
            <DialogDescription>
              {active?.specialty}
              {active?.fee != null ? ` · ₹${active.fee} consult` : ""}
            </DialogDescription>
          </DialogHeader>

          {active?.description && (
            <p className="text-sm text-muted-foreground">{active.description}</p>
          )}
          {(active?.clinic || active?.city) && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {[active?.clinic, active?.city, active?.pincode].filter(Boolean).join(", ")}
            </p>
          )}

          <div className="mt-2">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-primary" /> Available slots
            </p>
            {detail?.slots?.length > 0 && (
              <div className="mb-2">
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponInfo(null); setCouponMsg(""); }}
                    placeholder="Coupon code (optional)"
                    className="h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button variant="outline" onClick={() => applyCoupon()} disabled={applying || !coupon.trim()}>
                    {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {availCoupons.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Available coupons</p>
                    {availCoupons.map((c) => (
                      <div key={c.code} className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs">
                        <span>
                          <span className="font-semibold tracking-wide">{c.code}</span>
                          <span className="ml-2 text-muted-foreground">{c.label}{c.note ? ` · ${c.note}` : ""}</span>
                        </span>
                        <button type="button" className="font-medium text-primary hover:underline" onClick={() => applyCoupon(c.code)}>
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {couponMsg && <p className="mt-1 text-xs text-destructive">{couponMsg}</p>}
                {couponInfo && (
                  <p className="mt-1 text-xs text-emerald-400">
                    Coupon applied — pay ₹{Math.round(couponInfo.final / 100)} (save ₹{Math.round(couponInfo.discount / 100)}).
                  </p>
                )}
              </div>
            )}
            {detailLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : !detail?.slots?.length ? (
              <p className="text-sm text-muted-foreground">No open slots right now.</p>
            ) : (
              <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {detail.slots.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => book(s)}
                    disabled={!!booking}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-secondary/40 disabled:opacity-50"
                  >
                    <span>{new Date(s.start_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                    {booking === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-primary">Book</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
