import Link from "next/link";
import { FlaskConical, Building2, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function TestCard({
  name,
  slug,
  turnaround = 12,
}: {
  name: string;
  slug: string;
  turnaround?: number;
}) {
  return (
    <Link
      href={`/test/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow-sm"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-0" />

      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <FlaskConical className="h-6 w-6" />
        </span>
        <Badge variant="warning">20% off</Badge>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug">
        {name}
      </h3>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-primary" />
          Compare labs
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary" />
          Report in {turnaround} hrs
        </span>
      </div>

      <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-md border border-border py-2 text-sm font-medium transition-colors group-hover:border-primary/50 group-hover:text-primary">
        View labs &amp; prices
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default TestCard;
