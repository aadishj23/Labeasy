"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Trash2, Megaphone } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const rupee = (paise: number) =>
  `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

const placement = (l: any) =>
  l.scope === "EVERYWHERE"
    ? "Everywhere"
    : l.scope === "DIRECTORY"
      ? "Labs directory"
      : l.test_names?.length
        ? `Tests: ${l.test_names.join(", ")}`
        : "Tests";

export default function AdminSponsored() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/admin/sponsored");
      if (res.ok) setListings((await res.json()).listings || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string, active: boolean) => {
    await adminFetch(`/api/v1/admin/sponsored/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    });
    load();
  };

  const remove = async (id: string) => {
    await adminFetch(`/api/v1/admin/sponsored/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
        No sponsorships yet. Labs purchase these from their dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((l) => {
        const live =
          l.active && (!l.ends_at || new Date(l.ends_at) >= new Date());
        return (
          <div
            key={l.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Megaphone className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{l.lab?.lab_name}</h3>
                  <Badge variant={live ? "success" : "secondary"}>
                    {live ? "Live" : l.active ? "Expired" : "Paused"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {placement(l)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {fmt(l.starts_at)} → {fmt(l.ends_at)} · paid {rupee(l.amount)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggle(l.id, !l.active)}
              >
                {l.active ? "Pause" : "Resume"}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => remove(l.id)}
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
