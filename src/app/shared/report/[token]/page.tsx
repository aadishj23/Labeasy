import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, Building2, Download, ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared report | Labeasy",
  robots: { index: false, follow: false }, // don't index private shares
};

function flagOf(v: number, low?: number | null, high?: number | null) {
  if (low != null && v < low) return "low";
  if (high != null && v > high) return "high";
  if (low != null || high != null) return "normal";
  return null;
}

async function getShared(token: string) {
  return prisma.report.findUnique({
    where: { share_token: token },
    include: {
      order: {
        select: {
          lab: { select: { lab_name: true } },
          items: { select: { test_name: true } },
        },
      },
    },
  });
}

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = await getShared(token).catch(() => null);
  if (!report) redirect("/");

  const rows = Array.isArray(report.results)
    ? (report.results as any[])
    : (report.results as any)?.analytes || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Shared report
        </Badge>
        <div className="mt-4 flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <FileText className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {report.order?.items?.map((i) => i.test_name).join(", ") || "Report"}
            </h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {report.order?.lab?.lab_name}
              {" · "}
              {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {report.file_url && (
          <a
            href={report.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-primary via-sky-400 to-cyan-300 px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" /> Download report PDF
          </a>
        )}

        {rows.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Analyte</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((a: any, i: number) => {
                  const v = Number(a.value);
                  const f = Number.isFinite(v)
                    ? flagOf(v, a.ref_low, a.ref_high)
                    : null;
                  return (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3">
                        {a.value}
                        {a.unit ? ` ${a.unit}` : ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.ref_low != null || a.ref_high != null
                          ? `${a.ref_low ?? "—"}–${a.ref_high ?? "—"}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {f && (
                          <Badge
                            variant={
                              f === "normal"
                                ? "success"
                                : f === "high"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {f}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!report.file_url && rows.length === 0 && (
          <p className="mt-8 text-muted-foreground">
            This report has no viewable content.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}
