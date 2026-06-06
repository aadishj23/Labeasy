"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after the component has mounted on the client.
 * This app is a client-driven SPA (localStorage-based auth, charts), so
 * we skip server rendering of the app tree to avoid hydration mismatches from
 * localStorage-derived state. Both the server render and the first client
 * render return null, so there is no mismatch.
 */
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
