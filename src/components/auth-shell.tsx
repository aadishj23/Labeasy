"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Wallet, FileText } from "lucide-react";
import Navbar from "@/components/navbar";

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "NABL-accredited lab network" },
  { icon: Wallet, text: "Best prices, compared instantly" },
  { icon: FileText, text: "Secure, always-available reports" },
];

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative spotlight">
        <div className="absolute inset-0 -z-10 bg-grid-faint bg-[size:40px_40px] opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-28 lg:px-8">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2">
            {/* Brand panel */}
            <div className="hidden lg:block">
              <Image
                src="/assets/logocbs.png"
                alt="Labeasy"
                width={160}
                height={44}
                className="h-10 w-auto"
              />
              <h2 className="mt-8 text-4xl font-bold leading-tight">
                Your health,{" "}
                <span className="text-gradient-primary">on demand.</span>
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Book diagnostic tests, compare labs, and access your reports — all
                in one secure platform.
              </p>
              <ul className="mt-8 space-y-4">
                {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-foreground/90">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form card */}
            <div className="mx-auto w-full" style={{ maxWidth: wide ? 520 : 420 }}>
              <div className="glass rounded-2xl p-6 shadow-glow-sm sm:p-8">
                <div className="mb-6">
                  {eyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                      {eyebrow}
                    </p>
                  )}
                  <h1 className="mt-1 text-2xl font-bold">{title}</h1>
                  {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                  )}
                </div>
                {children}
                {footer && (
                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    {footer}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Link };
