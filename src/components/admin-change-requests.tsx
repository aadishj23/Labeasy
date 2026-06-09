"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Check, X, Loader2, ArrowRight } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Req = {
  id: string;
  vendor_type: "LAB" | "DOCTOR" | "INSURANCE";
  vendorName: string;
  changes: Record<string, string>;
  created_at: string;
  current: Record<string, any> | null;
};

const TYPE_LABEL: Record<string, string> = {
  LAB: "Lab",
  DOCTOR: "Doctor",
  INSURANCE: "Insurer",
};

export default function AdminChangeRequests() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/profile-requests?status=PENDING");
      if (res.ok) {
        const d = await res.json();
        setRequests(d.requests || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id + action);
    try {
      const res = await adminFetch(`/api/v1/admin/profile-requests/${id}`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (res.ok) load();
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
        No pending change requests.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Building2 className="h-5 w-5" />
            </span>
            <h3 className="font-semibold">{r.vendorName}</h3>
            <Badge variant="secondary">{TYPE_LABEL[r.vendor_type] || r.vendor_type}</Badge>
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(r.changes || {}).map(([field, next]) => (
              <div
                key={field}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm"
              >
                <span className="w-28 shrink-0 capitalize text-muted-foreground">
                  {field.replace(/_/g, " ")}
                </span>
                <span className="text-muted-foreground line-through">
                  {String(r.current?.[field] ?? "—")}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">{String(next)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 border-t border-border pt-4">
            <Button
              size="sm"
              variant="gradient"
              onClick={() => act(r.id, "approve")}
              disabled={!!busy}
            >
              {busy === r.id + "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => act(r.id, "reject")}
              disabled={!!busy}
            >
              {busy === r.id + "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
