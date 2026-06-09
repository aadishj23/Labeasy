"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, CalendarClock, CalendarRange, UserPlus, ChevronDown, CalendarX } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DateTimePicker from "@/components/datetime-picker";
import TimeSelect from "@/components/time-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 0, label: "Sun" },
];

const input =
  "h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function DoctorSlots() {
  const [slots, setSlots] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDay, setOpenDay] = useState<string | null>(null);

  // single (separate date + time)
  const [sDate, setSDate] = useState("");
  const [sTime, setSTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [capacity, setCapacity] = useState("1");
  const [saving, setSaving] = useState(false);

  const singleStart =
    sDate && sTime
      ? (() => {
          const [y, mo, d] = sDate.split("-").map(Number);
          const [h, mi] = sTime.split(":").map(Number);
          return new Date(y, mo - 1, d, h, mi, 0, 0).toISOString();
        })()
      : "";

  // recurring
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [fromT, setFromT] = useState("16:00");
  const [toT, setToT] = useState("19:00");
  const [rDur, setRDur] = useState(15);
  const [weeks, setWeeks] = useState(4);
  const [rCap, setRCap] = useState("1");
  const [generating, setGenerating] = useState(false);

  // manual booking
  const [bookSlot, setBookSlot] = useState<any>(null);
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [payStatus, setPayStatus] = useState("");
  const [amtPaid, setAmtPaid] = useState("");
  const [booking, setBooking] = useState(false);

  const openBook = (s: any) => {
    setPName("");
    setPPhone("");
    setPayStatus("");
    setAmtPaid("");
    setBookSlot(s);
  };

  const load = () =>
    Promise.all([
      fetch("/api/v1/doctor/slots", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { slots: [] }
      ),
      fetch("/api/v1/doctor/appointments", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { appointments: [] }
      ),
    ])
      .then(([s, a]) => {
        setSlots(s.slots || []);
        setAppts(a.appointments || []);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  // Group slots + bookings by local day.
  const localKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const schedule = useMemo(() => {
    const map = new Map<string, { key: string; ms: number; slots: any[]; bookings: any[] }>();
    const ensure = (k: string, ms: number) => {
      if (!map.has(k)) map.set(k, { key: k, ms, slots: [], bookings: [] });
      return map.get(k)!;
    };
    for (const s of slots) ensure(localKey(s.start_at), new Date(s.start_at).setHours(0, 0, 0, 0)).slots.push(s);
    for (const a of appts) ensure(localKey(a.scheduled_at), new Date(a.scheduled_at).setHours(0, 0, 0, 0)).bookings.push(a);
    return [...map.values()].sort((x, y) => x.ms - y.ms);
  }, [slots, appts]);

  const cancelDay = async (day: any) => {
    const ids = day.slots.map((s: any) => s.id);
    const booked = day.slots.reduce((n: number, s: any) => n + s.booked_count, 0);
    if (ids.length === 0) return;
    if (!window.confirm(`Cancel all ${ids.length} slot(s) on this day${booked ? ` and ${booked} booking(s)` : ""}?`)) return;
    await fetch("/api/v1/doctor/slots/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotIds: ids }),
    });
    load();
  };

  const addSingle = async () => {
    if (!singleStart) return setError("Pick a date and time.");
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/v1/doctor/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_at: singleStart, duration_min: duration, capacity: Math.max(1, Number(capacity) || 1) }),
      });
      const d = await res.json();
      if (!res.ok) return setError(d.message || "Could not add slot.");
      setSDate("");
      setSTime("");
      load();
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    setError("");
    if (days.length === 0) return setError("Pick at least one weekday.");
    const [fh, fm] = fromT.split(":").map(Number);
    const [th, tm] = toT.split(":").map(Number);
    const fromMin = fh * 60 + fm;
    const toMin = th * 60 + tm;
    if (toMin - fromMin < rDur) return setError("Time window is too short for the slot length.");

    const starts: string[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const now = Date.now();
    for (let i = 0; i < weeks * 7; i++) {
      const day = new Date(base);
      day.setDate(base.getDate() + i);
      if (!days.includes(day.getDay())) continue;
      for (let m = fromMin; m + rDur <= toMin; m += rDur) {
        const t = new Date(day);
        t.setHours(Math.floor(m / 60), m % 60, 0, 0);
        if (t.getTime() > now) starts.push(t.toISOString());
      }
    }
    if (starts.length === 0) return setError("No future slots in that range.");

    setGenerating(true);
    try {
      const res = await fetch("/api/v1/doctor/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starts, durationMin: rDur, capacity: Math.max(1, Number(rCap) || 1) }),
      });
      const d = await res.json();
      if (!res.ok) return setError(d.message || "Could not generate slots.");
      load();
    } finally {
      setGenerating(false);
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/v1/doctor/slots/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.message || "Could not delete.");
      return;
    }
    load();
  };

  const submitBooking = async () => {
    if (!bookSlot || !pName.trim()) return;
    if (!payStatus) return setError("Select a payment status.");
    setBooking(true);
    try {
      const res = await fetch(`/api/v1/doctor/slots/${bookSlot.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: pName,
          patient_phone: pPhone,
          paid_status: payStatus,
          amount_paid: payStatus === "PARTIAL" ? Number(amtPaid) || 0 : undefined,
        }),
      });
      if (res.ok) {
        setBookSlot(null);
        setPName("");
        setPPhone("");
        load();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || "Could not book.");
      }
    } finally {
      setBooking(false);
    }
  };

  const toggleDay = (n: number) =>
    setDays((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Availability</h1>
            <p className="text-muted-foreground">Add slots patients can book — or mark them booked yourself.</p>
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        {/* Recurring generator */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CalendarRange className="h-4 w-4 text-primary" /> Generate recurring slots
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d) => (
              <button
                key={d.n}
                type="button"
                onClick={() => toggleDay(d.n)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  days.includes(d.n)
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
              <input type="time" value={fromT} onChange={(e) => setFromT(e.target.value)} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
              <input type="time" value={toT} onChange={(e) => setToT(e.target.value)} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Slot length</label>
              <select value={rDur} onChange={(e) => setRDur(Number(e.target.value))} className={input}>
                {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">For</label>
              <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className={input}>
                {[1, 2, 4, 8, 12].map((w) => <option key={w} value={w}>{w} week{w > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Capacity</label>
              <input type="number" min={1} value={rCap} onChange={(e) => setRCap(e.target.value)} className={`${input} w-20`} />
            </div>
            <Button variant="gradient" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarRange className="h-4 w-4" />} Generate
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Capacity = how many patients can book each slot (1 = one-on-one).
          </p>
        </div>

        {/* Single slot */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4 text-primary" /> Add a single slot
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <DateTimePicker
                value={sDate}
                onChange={(d) => {
                  setSDate(d);
                  setSTime("");
                }}
                variant="future"
                placeholder="Pick a date"
              />
            </div>
            <div className="w-36">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Time</label>
              <TimeSelect value={sTime} onChange={setSTime} date={sDate} disabled={!sDate} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Length</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={input}>
                {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground" title="Patients who can book this slot">
                Capacity
              </label>
              <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={`${input} w-20`} />
            </div>
            <Button variant="outline" onClick={addSingle} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </Button>
          </div>
        </div>

        {/* Day-by-day */}
        <h2 className="mb-3 mt-8 text-lg font-semibold">Your schedule</h2>
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : schedule.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slots yet. Generate or add some above.</p>
          ) : (
            schedule.map((day) => {
              const open = openDay === day.key;
              const booked = day.slots.reduce((n: number, s: any) => n + s.booked_count, 0);
              const label = new Date(day.ms).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
              return (
                <div key={day.key} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between gap-3 p-4">
                    <button className="flex flex-1 items-center gap-2 text-left" onClick={() => setOpenDay(open ? null : day.key)}>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                      <span>
                        <span className="font-semibold">{label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {day.slots.length} slot{day.slots.length === 1 ? "" : "s"} · {booked} booked
                        </span>
                      </span>
                    </button>
                    {day.slots.length > 0 && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => cancelDay(day)}>
                        <CalendarX className="h-4 w-4" /> Cancel day
                      </Button>
                    )}
                  </div>

                  {open && (
                    <div className="border-t border-border p-4">
                      {/* Slots */}
                      <div className="space-y-2">
                        {day.slots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No open slots this day.</p>
                        ) : (
                          day.slots
                            .slice()
                            .sort((a: any, b: any) => +new Date(a.start_at) - +new Date(b.start_at))
                            .map((s: any) => {
                              const full = s.booked_count >= s.capacity;
                              return (
                                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                                  <div>
                                    <p className="font-medium">{new Date(s.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {Math.round((new Date(s.end_at).getTime() - new Date(s.start_at).getTime()) / 60000)} min · {s.booked_count}/{s.capacity} booked
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {full ? <Badge variant="success">Full</Badge> : (
                                      <Button size="sm" variant="ghost" onClick={() => openBook(s)}>
                                        <UserPlus className="h-4 w-4" /> Mark booked
                                      </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => remove(s.id)} aria-label="Cancel slot">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>

                      {/* Bookings */}
                      {day.bookings.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bookings</p>
                          <div className="space-y-1.5">
                            {day.bookings
                              .slice()
                              .sort((a: any, b: any) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at))
                              .map((a: any) => (
                                <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                  <span>
                                    {new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                                    {a.user?.name || a.patient_name || "Patient"}
                                  </span>
                                  <Badge variant={a.status === "COMPLETED" ? "success" : a.status === "CANCELLED" ? "destructive" : "default"}>
                                    {a.status}
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Manual booking dialog */}
      <Dialog open={!!bookSlot} onOpenChange={(o) => !o && setBookSlot(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark slot booked</DialogTitle>
            <DialogDescription>
              {bookSlot && new Date(bookSlot.start_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              {" "}— for an off-platform patient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input className={`${input} w-full`} placeholder="Patient name *" value={pName} onChange={(e) => setPName(e.target.value)} />
            <input className={`${input} w-full`} placeholder="Patient phone" value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Payment status *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "PAID", label: "Paid" },
                  { v: "PARTIAL", label: "Partial" },
                  { v: "UNPAID", label: "Not paid" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setPayStatus(o.v)}
                    className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                      payStatus === o.v
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            {payStatus === "PARTIAL" && (
              <input
                className={`${input} w-full`}
                type="number"
                min={0}
                placeholder="Amount paid (₹)"
                value={amtPaid}
                onChange={(e) => setAmtPaid(e.target.value)}
              />
            )}
            <Button variant="gradient" className="w-full" onClick={submitBooking} disabled={booking || !pName.trim() || !payStatus}>
              {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
