import Link from "next/link";
import { Button } from "@/components/ui/button";

// Safety-net 404 (unknown top-level paths are redirected home by the
// [...slug] catch-all; this renders only if a route explicitly calls notFound()).
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center spotlight">
      <p className="text-7xl font-bold text-gradient-primary">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Button asChild variant="gradient" className="mt-2">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
