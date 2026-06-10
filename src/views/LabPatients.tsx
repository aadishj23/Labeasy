"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Users, Search, Plus, UserRound, FlaskConical } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DateTimePicker from "@/components/datetime-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const field =
  "h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" } as any);

export default function LabPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", gender: "", dob: "" });
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState("");

  const [active, setActive] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [payStatus, setPayStatus] = useState("");
  const [amtPaid, setAmtPaid] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookMsg, setBookMsg] = useState("");

  const load = (query = q) => {
    setLoading(true);
    return fetch(`/api/v1/vendor/patients?q=${encodeURIComponent(query)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { patients: [] }))
      .then((d) => setPatients(d.patients || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(""); /* eslint-disable-next-line */ }, []);

  const addPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddErr("");
    setAdding(true);
    try {
      const res = await fetch("/api/v1/vendor/patients", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) return setAddErr(d.message || "Could not add patient.");
      setForm({ name: "", phone: "", gender: "", dob: "" });
      load("");
    } finally {
      setAdding(false);
    }
  };

  const togglePick = (id: string) =>
    setPicked((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openProfile = async (p: any) => {
    setActive({ patient: p, history: [] });
    setProfileLoading(true);
    setPicked([]); setPayStatus(""); setAmtPaid(""); setBookMsg("");
    try {
      const [profRes, testsRes] = await Promise.all([
        fetch(`/api/v1/vendor/patients/${p.id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        axios.post("/api/v1/tests/gettestsforlab").then((r) => r.data).catch(() => ({ tests: [] })),
      ]);
      if (profRes) setActive(profRes);
      setLabTests(testsRes.tests || []);
    } finally {
      setProfileLoading(false);
    }
  };

  const bookTest = async () => {
    if (!active?.patient || picked.length === 0 || !payStatus) {
      setBookMsg("Pick at least one test and a payment status.");
      return;
    }
    setBooking(true);
    setBookMsg("");
    try {
      const res = await fetch("/api/v1/labs/orders/manual", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: active.patient.id,
          testIds: picked,
          paid_status: payStatus,
          amount_paid: payStatus === "PARTIAL" ? Number(amtPaid) || 0 : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) return setBookMsg(d.message || "Could not book.");
      setBookMsg("Booked!");
      openProfile(active.patient);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Patients</h1>
            <p className="text-muted-foreground">Your catalogue — manual entries and Labeasy patients who booked you.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
          {/* Add */}
          <div className="lg:sticky lg:top-24 lg:h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">Add a patient</h2>
            <form className="space-y-3" onSubmit={addPatient}>
              <input className={field} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={field} placeholder="Phone (10 digits) *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
              <select className={field} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Gender *</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Date of birth *</label>
                <DateTimePicker variant="past" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} placeholder="Select date of birth" />
              </div>
              {addErr && <p className="text-sm text-destructive">{addErr}</p>}
              <Button type="submit" variant="gradient" className="w-full" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add patient
              </Button>
            </form>
          </div>

          {/* List */}
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="Search by name or phone"
                className="h-11 w-full rounded-xl border border-input bg-secondary/40 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : patients.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">No patients yet.</div>
            ) : (
              <div className="space-y-2">
                {patients.map((p) => (
                  <button key={p.id} onClick={() => openProfile(p)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><UserRound className="h-5 w-5" /></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          {p.linked ? <Badge variant="success">Labeasy</Badge> : <Badge variant="secondary">Manual</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.phone}{p.gender ? ` · ${p.gender.toLowerCase()}` : ""}{p.age != null ? ` · ${p.age}y` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-primary">View →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Profile */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.patient?.name}</DialogTitle>
            <DialogDescription>
              {active?.patient?.phone}
              {active?.patient?.gender ? ` · ${active.patient.gender.toLowerCase()}` : ""}
              {active?.patient?.age != null ? ` · ${active.patient.age}y` : ""}
              {active?.patient?.linked ? " · Labeasy account" : ""}
            </DialogDescription>
          </DialogHeader>

          {/* Book a test */}
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium"><FlaskConical className="h-4 w-4 text-primary" /> Book a test</p>
            {labTests.length === 0 ? (
              <p className="text-xs text-muted-foreground">Add tests to your catalogue first.</p>
            ) : (
              <div className="space-y-2">
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {labTests.map((t) => (
                    <label key={t.test_id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-secondary/40">
                      <input type="checkbox" checked={picked.includes(t.test_id)} onChange={() => togglePick(t.test_id)} className="h-4 w-4 accent-primary" />
                      <span className="flex-1">{t.test_name}</span>
                      <span className="text-xs text-muted-foreground">₹{t.test_price}</span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: "PAID", l: "Paid" }, { v: "PARTIAL", l: "Partial" }, { v: "UNPAID", l: "Not paid" }].map((o) => (
                    <button key={o.v} type="button" onClick={() => setPayStatus(o.v)}
                      className={`rounded-lg border px-2 py-1.5 text-xs ${payStatus === o.v ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
                {payStatus === "PARTIAL" && (
                  <input className={field} type="number" placeholder="Amount paid (₹)" value={amtPaid} onChange={(e) => setAmtPaid(e.target.value)} />
                )}
                {bookMsg && <p className="text-xs text-muted-foreground">{bookMsg}</p>}
                <Button variant="gradient" className="w-full" onClick={bookTest} disabled={booking || picked.length === 0 || !payStatus}>
                  {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm booking"}
                </Button>
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <p className="mb-2 text-sm font-medium">History</p>
            {profileLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : !active?.history?.length ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {active.history.map((h: any, i: number) => (
                  <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span>{fmtDate(h.date)}{h.source === "MANUAL" ? " · manual" : ""}</span>
                      <span className="flex items-center gap-2">
                        {h.amount ? <span className="text-muted-foreground">₹{Math.round(h.amount / 100)}</span> : null}
                        <Badge variant={h.status === "COMPLETED" ? "success" : h.status === "CANCELLED" ? "destructive" : "default"}>{h.status}</Badge>
                      </span>
                    </div>
                    {h.tests?.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{h.tests.join(", ")}</p>
                    )}
                  </div>
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
