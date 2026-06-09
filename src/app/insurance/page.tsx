import type { Metadata } from "next";
import { ShieldCheck, HeartPulse } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Health insurance plans | Labeasy",
  description:
    "Browse and buy health insurance plans from partner insurers on Labeasy.",
  alternates: { canonical: "/insurance" },
};

async function getPlans() {
  const companies = await prisma.insuranceCompany.findMany({
    where: { status: "APPROVED", active: true },
    include: {
      plans: { where: { active: true }, orderBy: { price: "asc" } },
    },
  });
  return companies.flatMap((c) =>
    c.plans.map((p) => ({
      ...p,
      companyName: c.name,
      companyLogo: c.logo_url,
    }))
  );
}

export default async function InsurancePage() {
  const plans = await getPlans();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Health insurance plans
          </h1>
          <p className="mt-3 text-muted-foreground">
            Compare plans from partner insurers and protect your family&apos;s
            health.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
            <HeartPulse className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3">Insurance plans are coming soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-6"
              >
                <Badge variant="secondary" className="w-fit">
                  {p.companyName}
                </Badge>
                <h2 className="mt-3 font-semibold">{p.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {p.description}
                </p>
                <p className="mt-4 text-2xl font-bold">
                  ₹{Math.round(p.price / 100).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
