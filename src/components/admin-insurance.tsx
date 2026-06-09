"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Trash2, ShieldCheck, Check, X, FileText, Ban } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, any> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
};

export default function AdminInsurance() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [pendingPlans, setPendingPlans] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        adminFetch("/api/v1/admin/insurance"),
        adminFetch("/api/v1/admin/insurance/plans"),
      ]);
      if (cRes.ok) setCompanies((await cRes.json()).companies || []);
      if (pRes.ok) setPendingPlans((await pRes.json()).plans || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const approvePlan = async (id: string) => {
    await adminFetch(`/api/v1/admin/insurance/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ commission_approved: true }),
    });
    load();
  };

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    await adminFetch(`/api/v1/admin/insurance/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this company and all its plans?")) return;
    await adminFetch(`/api/v1/admin/insurance/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Plans awaiting commission approval */}
      {pendingPlans.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h3 className="mb-3 font-semibold text-amber-300">
            Plans awaiting commission approval ({pendingPlans.length})
          </h3>
          <div className="space-y-2">
            {pendingPlans.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                <div className="text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    {p.company?.name} · ₹{Math.round(p.price / 100).toLocaleString("en-IN")} · {p.commission_pct}% commission
                  </span>
                </div>
                <Button size="sm" variant="gradient" onClick={() => approvePlan(p.id)}>
                  <Check className="h-4 w-4" /> Approve commission
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {companies.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
          No insurance companies yet. They register themselves and appear here for approval.
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
        <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{c.name}</h3>
                <Badge variant={STATUS_VARIANT[c.status] || "secondary"}>
                  {c.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.email} · {c._count?.plans ?? 0} plans · {c._count?.leads ?? 0}{" "}
                leads
              </p>
              {c.license_url && (
                <a
                  href={c.license_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <FileText className="h-3 w-3" /> View license
                </a>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            {c.status !== "APPROVED" && (
              <Button size="sm" variant="ghost" onClick={() => setStatus(c.id, "APPROVED")}>
                <Check className="h-4 w-4" /> {c.status === "SUSPENDED" ? "Reactivate" : "Approve"}
              </Button>
            )}
            {c.status === "PENDING" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setStatus(c.id, "REJECTED")}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            )}
            {c.status === "APPROVED" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setStatus(c.id, "SUSPENDED")}
              >
                <Ban className="h-4 w-4" /> Suspend
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => remove(c.id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          </div>

          {c.plans?.length > 0 && (
            <button
              onClick={() => setOpenId(openId === c.id ? null : c.id)}
              className="mt-3 text-xs font-medium text-primary hover:underline"
            >
              {openId === c.id ? "Hide plans" : `View ${c.plans.length} plan${c.plans.length === 1 ? "" : "s"}`}
            </button>
          )}
          {openId === c.id && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              {c.plans.map((p: any) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ₹{Math.round(p.price / 100).toLocaleString("en-IN")} · {p.commission_pct}% ·{" "}
                    {p.active ? "Active" : "Hidden"} · {p.commission_approved ? "Live" : "Pending approval"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
          ))}
        </div>
      )}
    </div>
  );
}
