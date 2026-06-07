"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Play, Check, Ban } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";

const rupee = (paise: number) =>
  `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;

const lastMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const STATUS_VARIANT: Record<string, string> = {
  PENDING: "text-amber-400",
  PAID: "text-emerald-400",
  WAIVED: "text-muted-foreground",
};

export default function AdminBilling() {
  const [period, setPeriod] = useState(lastMonth());
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const load = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/v1/admin/billing?period=${p}`);
      if (res.ok) setInvoices((await res.json()).invoices || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  const run = async () => {
    setRunning(true);
    try {
      const res = await adminFetch("/api/v1/admin/billing", {
        method: "POST",
        body: JSON.stringify({ period }),
      });
      if (res.ok) load(period);
    } finally {
      setRunning(false);
    }
  };

  const mark = async (id: string, status: string) => {
    const res = await adminFetch(`/api/v1/admin/billing/${id}`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    if (res.ok) load(period);
  };

  const totalFee = invoices.reduce((s, i) => s + i.fee, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Billing month
          </label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="gradient" onClick={run} disabled={running}>
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run billing
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">
          {invoices.length} invoices · total fee{" "}
          <span className="font-semibold text-foreground">{rupee(totalFee)}</span>
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
          No invoices for this month. Click &ldquo;Run billing&rdquo; to generate
          them.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Lab</th>
                <th className="px-4 py-3">GMV</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-medium">{inv.lab?.lab_name}</td>
                  <td className="px-4 py-3">{rupee(inv.gmv)}</td>
                  <td className="px-4 py-3 font-semibold">{rupee(inv.fee)}</td>
                  <td
                    className={`px-4 py-3 font-medium ${STATUS_VARIANT[inv.status]}`}
                  >
                    {inv.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {inv.status !== "PAID" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => mark(inv.id, "PAID")}
                        >
                          <Check className="h-4 w-4" /> Paid
                        </Button>
                      )}
                      {inv.status !== "WAIVED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => mark(inv.id, "WAIVED")}
                        >
                          <Ban className="h-4 w-4" /> Waive
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
