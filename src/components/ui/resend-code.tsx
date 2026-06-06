"use client";

import { useEffect, useState } from "react";

/**
 * "Resend code" control with a countdown cooldown. Starts in cooldown on mount
 * (a code was just sent), and restarts after each resend attempt.
 */
export function ResendCode({ onResend, seconds = 30 }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const handle = async () => {
    setLeft(seconds); // restart cooldown immediately to prevent rapid clicks
    try {
      await onResend();
    } catch {
      /* error surfaced by caller */
    }
  };

  if (left > 0) {
    return (
      <span className="text-sm text-muted-foreground">Resend in {left}s</span>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="text-sm font-medium text-primary hover:underline"
    >
      Resend code
    </button>
  );
}
