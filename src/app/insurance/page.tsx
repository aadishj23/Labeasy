import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Check, ArrowRight, HeartPulse } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Health insurance partners — save on diagnostic tests | Labeasy",
  description:
    "Get insured through Labeasy's partner insurers and unlock extra discounts on diagnostic tests. Compare plans and protect your family's health.",
  alternates: { canonical: "/insurance" },
};

async function getPartners() {
  return prisma.insurancePartner.findMany({
    where: { active: true },
    orderBy: { created_at: "asc" },
  });
}

export default async function InsurancePage() {
  const partners = await getPartners();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Get insured, save on every test
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign up with one of our partner insurers and unlock an{" "}
            <span className="font-medium text-foreground">
              extra discount on diagnostic tests
            </span>{" "}
            booked through Labeasy — protection for your health and your wallet.
          </p>
        </div>

        {partners.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
            <HeartPulse className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3">Insurance partners are coming soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  {p.logo_url ? (
                    <Image
                      src={p.logo_url}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-xl object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                  )}
                  <div>
                    <h2 className="font-semibold">{p.name}</h2>
                    {p.test_discount_pct > 0 && (
                      <Badge variant="success" className="mt-1">
                        Save {p.test_discount_pct}% on tests
                      </Badge>
                    )}
                  </div>
                </div>

                {p.blurb && (
                  <p className="mt-4 text-sm text-muted-foreground">{p.blurb}</p>
                )}

                {p.plan_highlights.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {p.plan_highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href={`/api/v1/insurance/${p.slug}/refer`}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Get insured <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          Labeasy may earn a referral commission from partner insurers. Your test
          discount is applied automatically at checkout once your referral is
          confirmed.
        </p>
      </section>

      <Footer />
    </div>
  );
}
