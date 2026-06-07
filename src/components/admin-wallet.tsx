"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Play, Wallet } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";

const rupee = (paise: number) =>
  `₹${Math.abs(Math.round(paise / 100)).toLocaleString("en-IN")}`;

const lastMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function AdminWallet() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(lastMonth());
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/wallet");
      if (res.ok) setLabs((await res.json()).labs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const validPeriod = /^\d{4}-(0[1-9]|1[0-2])$/.test(period);

  const runFees = async () => {
    if (!validPeriod) return;
    setRunning(true);
    try {
      const res = await adminFetch("/api/v1/admin/wallet", {
        method: "POST",
        body: JSON.stringify({ period }),
      });
      if (res.ok) load();
    } finally {
      setRunning(false);
    }
  };

  const settle = async (labId: string, balance: number) => {
    if (
      !window.confirm(
        `Settle ${rupee(balance)} to this lab? Enter the reference next.`
      )
    )
      return;
    const reference = window.prompt("Settlement reference / UTR:") || "";
    const res = await adminFetch(`/api/v1/admin/wallet/${labId}/settle`, {
      method: "POST",
      body: JSON.stringify({ reference }),
    });
    if (res.ok) load();
  };

  const owedTotal = labs
    .filter((l) => l.balance > 0)
    .reduce((s, l) => s + l.balance, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Platform-fee month
          </label>
          <input
            type="month"
            value={period}
            max={lastMonth()}
            onChange={(e) => setPeriod(e.target.value)}
            className={`h-10 rounded-md border bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              validPeriod ? "border-input" : "border-destructive"
            }`}
          />
          {!validPeriod && (
            <p className="mt-1 text-xs text-destructive">
              Pick a valid month.
            </p>
          )}
        </div>
        <Button
          variant="gradient"
          onClick={runFees}
          disabled={running || !validPeriod}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run platform fees
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">
          Total owed to labs{" "}
          <span className="font-semibold text-foreground">
            {rupee(owedTotal)}
          </span>
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : labs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
          No wallet activity yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Lab</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {labs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium">{l.lab_name}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      l.balance > 0
                        ? "text-emerald-400"
                        : l.balance < 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {l.balance < 0 ? "−" : ""}
                    {rupee(l.balance)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      {l.balance > 0 ? "owed" : l.balance < 0 ? "outstanding" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {rupee(l.pending)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {l.balance > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => settle(l.id, l.balance)}
                        >
                          <Wallet className="h-4 w-4" /> Settle
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
