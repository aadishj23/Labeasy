"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Play, Wallet, BellRing, ChevronDown } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const rupee = (paise: number) =>
  `₹${Math.abs(Math.round(paise / 100)).toLocaleString("en-IN")}`;

const TYPE_LABEL: Record<string, string> = { LAB: "Lab", DOCTOR: "Doctor", INSURANCE: "Insurer" };
const ENTRY_LABEL: Record<string, string> = {
  ORDER_EARNING: "Earning",
  PLATFORM_FEE: "Platform fee",
  SPONSORSHIP: "Featured placement",
  COMMISSION: "Referral commission",
  PAYOUT: "Payout",
  ADJUSTMENT: "Adjustment",
};

export default function AdminWallet() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "LAB" | "DOCTOR" | "INSURANCE">("ALL");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/wallet");
      if (res.ok) setVendors((await res.json()).vendors || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runPayouts = async () => {
    if (!window.confirm("Pay out every vendor we currently owe?")) return;
    setRunning(true);
    try {
      const res = await adminFetch("/api/v1/admin/wallet", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        window.alert(`Paid out ${d.paid} vendor(s), ${rupee(d.total)} total.`);
        load();
      }
    } finally {
      setRunning(false);
    }
  };

  const payout = async (v: any) => {
    const reference = window.prompt(`Pay out ${rupee(v.balance)} to ${v.name}. Reference / UTR:`);
    if (reference === null) return;
    const res = await adminFetch("/api/v1/admin/wallet/settle", {
      method: "POST",
      body: JSON.stringify({ ownerType: v.owner_type, ownerId: v.owner_id, action: "payout", reference }),
    });
    if (res.ok) load();
  };

  const remind = async (v: any) => {
    const res = await adminFetch("/api/v1/admin/wallet/settle", {
      method: "POST",
      body: JSON.stringify({ ownerType: v.owner_type, ownerId: v.owner_id, action: "reminder" }),
    });
    if (res.ok) window.alert(`Reminder logged for ${v.name} (due ${rupee(v.balance)}).`);
  };

  const toggleEntries = async (v: any) => {
    const key = `${v.owner_type}:${v.owner_id}`;
    if (openKey === key) {
      setOpenKey(null);
      return;
    }
    setOpenKey(key);
    setEntriesLoading(true);
    setEntries([]);
    try {
      const res = await adminFetch(`/api/v1/admin/wallet?ownerType=${v.owner_type}&ownerId=${v.owner_id}`);
      if (res.ok) setEntries((await res.json()).entries || []);
    } finally {
      setEntriesLoading(false);
    }
  };

  const filtered = filter === "ALL" ? vendors : vendors.filter((v) => v.owner_type === filter);
  const owedTotal = vendors.filter((v) => v.balance > 0).reduce((s, v) => s + v.balance, 0);
  const dueTotal = vendors.filter((v) => v.balance < 0).reduce((s, v) => s + Math.abs(v.balance), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="gradient" onClick={runPayouts} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run payouts
        </Button>
        <p className="text-xs text-muted-foreground">
          Monthly GMV fees (labs &amp; doctors) are charged automatically on the 1st.
        </p>
        <div className="ml-auto text-right text-sm">
          <p className="text-muted-foreground">We owe partners <span className="font-semibold text-emerald-400">{rupee(owedTotal)}</span></p>
          <p className="text-muted-foreground">Partners owe us <span className="font-semibold text-destructive">{rupee(dueTotal)}</span></p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { v: "ALL", label: "All" },
          { v: "LAB", label: "Labs" },
          { v: "DOCTOR", label: "Doctors" },
          { v: "INSURANCE", label: "Insurance" },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setFilter(t.v as any)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              filter === t.v
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:bg-secondary/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
          No wallet activity{filter === "ALL" ? " yet" : ` for ${filter.toLowerCase()}s`}.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => {
            const key = `${v.owner_type}:${v.owner_id}`;
            const open = openKey === key;
            return (
              <div key={key} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <button onClick={() => toggleEntries(v)} className="flex flex-1 items-center gap-2 text-left">
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    <span className="font-medium">{v.name}</span>
                    <Badge variant="secondary">{TYPE_LABEL[v.owner_type] || v.owner_type}</Badge>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${v.balance > 0 ? "text-emerald-400" : v.balance < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {v.balance < 0 ? "−" : ""}{rupee(v.balance)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {v.balance > 0 ? "we owe" : v.balance < 0 ? "owes us" : ""}
                      </span>
                    </span>
                    {v.balance > 0 && (
                      <Button size="sm" variant="ghost" onClick={() => payout(v)}>
                        <Wallet className="h-4 w-4" /> Pay out
                      </Button>
                    )}
                    {v.balance < 0 && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => remind(v)}>
                        <BellRing className="h-4 w-4" /> Send reminder
                      </Button>
                    )}
                  </div>
                </div>

                {open && (
                  <div className="border-t border-border p-4">
                    {entriesLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : entries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No transactions.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {entries.map((e) => (
                          <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                            <span><Badge variant={e.amount >= 0 ? "success" : "secondary"}>{ENTRY_LABEL[e.type] || e.type}</Badge>
                              <span className="ml-2 text-muted-foreground">{e.description || "—"}</span></span>
                            <span className="whitespace-nowrap">
                              <span className={e.amount >= 0 ? "text-emerald-400" : "text-destructive"}>{e.amount >= 0 ? "+" : "−"}{rupee(e.amount)}</span>
                              <span className="ml-2 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
