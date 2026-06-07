"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  FileText,
  ExternalLink,
  Check,
  X,
  RotateCcw,
  Loader2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FILTERS = ["PENDING", "VERIFIED", "SUSPENDED"] as const;
const STATUS_VARIANT: Record<string, any> = {
  PENDING: "warning",
  VERIFIED: "success",
  SUSPENDED: "destructive",
};

type Doc = { id: string; type: string; url: string };
type Lab = {
  id: string;
  lab_name: string;
  owner_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  license_no: string;
  gst_no: string;
  status: string;
  accreditations: string[];
  documents: Doc[];
  _count: { labTests: number };
};

function LabRow({ lab, onChanged }: { lab: Lab; onChanged: () => void }) {
  const [accr, setAccr] = useState(lab.accreditations.join(", "));
  const [busy, setBusy] = useState("");

  const setStatus = async (status: string) => {
    setBusy(status);
    try {
      const accreditations = accr
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const res = await adminFetch(`/api/v1/admin/labs/${lab.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status, accreditations }),
      });
      if (res.ok) onChanged();
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold">{lab.lab_name}</h3>
            <p className="text-sm text-muted-foreground">{lab.owner_name}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[lab.status]}>{lab.status}</Badge>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
        <span className="inline-flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> {lab.email}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" /> {lab.phone}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {[lab.city, lab.state].filter(Boolean).join(", ")}
        </span>
        <span>{lab._count.labTests} tests listed</span>
        <span>License: {lab.license_no}</span>
        <span>GST: {lab.gst_no}</span>
      </div>

      {/* Documents */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Documents ({lab.documents.length})
        </p>
        {lab.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {lab.documents.map((d) => (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-sm hover:border-primary/40"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="capitalize">{d.type}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Accreditations + actions */}
      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Accreditations (comma-separated, e.g. NABL, ICMR)
          </label>
          <Input
            value={accr}
            onChange={(e) => setAccr(e.target.value)}
            placeholder="NABL, ICMR"
          />
        </div>
        <div className="flex gap-2">
          {lab.status !== "VERIFIED" && (
            <Button
              size="sm"
              variant="gradient"
              onClick={() => setStatus("VERIFIED")}
              disabled={!!busy}
            >
              {busy === "VERIFIED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
          )}
          {lab.status !== "SUSPENDED" && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => setStatus("SUSPENDED")}
              disabled={!!busy}
            >
              {busy === "SUSPENDED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Suspend
            </Button>
          )}
          {lab.status !== "PENDING" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStatus("PENDING")}
              disabled={!!busy}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLabQueue() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/v1/admin/labs?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setLabs(data.labs || []);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : labs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
          No {filter.toLowerCase()} labs.
        </div>
      ) : (
        <div className="space-y-4">
          {labs.map((lab) => (
            <LabRow key={lab.id} lab={lab} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}
