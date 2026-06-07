"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  FileText,
  Loader2,
  ExternalLink,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DOC_TYPES = [
  { value: "license", label: "Lab license" },
  { value: "gst", label: "GST certificate" },
  { value: "nabl", label: "NABL accreditation" },
  { value: "other", label: "Other" },
];

const STATUS_META: Record<
  string,
  { label: string; icon: any; variant: any; note: string }
> = {
  PENDING: {
    label: "Pending verification",
    icon: Clock,
    variant: "warning",
    note: "Upload your documents below. An admin will review and verify your lab — until then it isn't listed publicly.",
  },
  VERIFIED: {
    label: "Verified",
    icon: ShieldCheck,
    variant: "success",
    note: "Your lab is verified and listed in the public directory.",
  },
  SUSPENDED: {
    label: "Suspended",
    icon: ShieldAlert,
    variant: "destructive",
    note: "Your lab is currently not listed. Please contact support.",
  },
};

type Doc = { id: string; type: string; url: string; created_at: string };
type Data = { status: string; accreditations: string[]; documents: Doc[] };

export default function LabVerification() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("license");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [inputKey, setInputKey] = useState(0);

  const load = async () => {
    try {
      const res = await fetch("/api/v1/labs/documents", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setErr("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/v1/labs/documents", {
        method: "POST",
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.message || "Upload failed.");
        return;
      }
      setInputKey((k) => k + 1); // reset file input
      await load();
    } finally {
      setUploading(false);
    }
  };

  if (loading || !data) return null;

  const meta = STATUS_META[data.status] || STATUS_META.PENDING;
  const Icon = meta.icon;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              Verification
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </h2>
            <p className="text-sm text-muted-foreground">{meta.note}</p>
          </div>
        </div>
        {data.accreditations?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.accreditations.map((a) => (
              <Badge key={a} variant="outline" className="gap-1">
                <BadgeCheck className="h-3 w-3" />
                {a}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Upload */}
        <form onSubmit={upload} className="space-y-3">
          <p className="text-sm font-medium">Upload a document</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            key={inputKey}
            name="file"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/70"
          />
          <p className="text-xs text-muted-foreground">PDF, JPG or PNG · max 5 MB</p>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" variant="gradient" disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </Button>
        </form>

        {/* Document list */}
        <div>
          <p className="mb-3 text-sm font-medium">
            Documents ({data.documents.length})
          </p>
          {data.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="capitalize">{doc.type}</span>
                  </span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
