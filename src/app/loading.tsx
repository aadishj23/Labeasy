import { Loader2 } from "lucide-react";

// Global route-transition loader (App Router fallback for any segment
// without its own loading state).
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  );
}
