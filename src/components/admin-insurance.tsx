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
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/insurance");
      if (res.ok) setCompanies((await res.json()).companies || []);
    } finally {
      setLoading(false);
    }
  }, []);

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
  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
        No insurance companies yet. They register themselves and appear here for
        approval.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5"
        >
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
      ))}
    </div>
  );
}
