"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  CalendarCheck,
  FileText,
  ShieldCheck,
  Star,
  Sparkles,
  Activity,
  Stethoscope,
  BellRing,
  Share2,
  Percent,
  Home as HomeIcon,
  Building2,
  BarChart3,
  Megaphone,
  Wallet,
  HeartPulse,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    icon: Search,
    title: "Search & compare",
    description:
      "Compare NABL-accredited labs by price, rating, and distance — by city or pincode.",
  },
  {
    icon: CalendarCheck,
    title: "Book your way",
    description:
      "Home sample collection or a lab visit. Pay securely and apply coupons at checkout.",
  },
  {
    icon: FileText,
    title: "Get digital reports",
    description:
      "Reports land in your inbox — stored securely, downloadable, and shareable by link.",
  },
  {
    icon: Sparkles,
    title: "Understand & act",
    description:
      "AI summaries, a health score, trends, and nearby specialists matched to your results.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI report summaries",
    description:
      "Plain-language explanations of your results — abnormal values highlighted, jargon removed.",
  },
  {
    icon: Activity,
    title: "Health score & trends",
    description:
      "A live health score plus every marker tracked over time, so you see the bigger picture.",
  },
  {
    icon: Stethoscope,
    title: "Book doctor consultations",
    description:
      "Find doctors near you by specialty, pick a time slot, and pay for the consult online.",
  },
  {
    icon: ShieldCheck,
    title: "Buy insurance plans",
    description:
      "Compare health plans from partner insurers and buy in a few taps — right here.",
  },
  {
    icon: BellRing,
    title: "Re-test reminders",
    description:
      "Set follow-up reminders so you never miss an important repeat test.",
  },
  {
    icon: Share2,
    title: "Secure reports & sharing",
    description:
      "All your reports in one place — share with a doctor via a private link, revoke anytime.",
  },
  {
    icon: Percent,
    title: "Packages & coupons",
    description:
      "Curated test packages and exclusive coupon codes for the best possible price.",
  },
  {
    icon: HomeIcon,
    title: "Home collection",
    description:
      "Skip the queue — schedule a sample pickup at your doorstep at a time that suits you.",
  },
];

const STATS = [
  { value: 50, suffix: "+", label: "Partner labs" },
  { value: 1000, suffix: "+", label: "Tests available" },
  { value: 5000, suffix: "+", label: "Happy customers" },
  { value: 98, suffix: "%", label: "Satisfaction" },
];

const PARTNER_PERKS = [
  { icon: Building2, label: "Your own vendor dashboard" },
  { icon: BarChart3, label: "Bookings & revenue analytics" },
  { icon: Megaphone, label: "Promote with featured placement" },
  { icon: Wallet, label: "Wallet & automated settlements" },
];

function useInView<T extends Element = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options ?? { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, inView] as const;
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden spotlight">
        <div className="absolute inset-0 -z-10 bg-grid-faint bg-[size:40px_40px] opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-32 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-28 lg:pt-40">
          {/* Copy */}
          <div className="animate-fade-up">
            <Badge variant="outline" className="mb-6 gap-1.5 py-1 pl-1.5 pr-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-3 w-3" />
              </span>
              Labs · doctors · insurance · AI health insights
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Your whole health journey, from booking to{" "}
              <span className="text-gradient-primary">understanding.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Compare accredited labs and book tests, consult doctors near you,
              and buy health insurance — all in one place, with AI-explained
              reports, trends, and a health score.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gradient" size="lg">
                <Link href="/tests">
                  Book a test
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/labs">Find a lab</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[12, 32, 45, 65].map((id) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={id}
                    src={`https://i.pravatar.cc/96?img=${id}`}
                    alt="Patient"
                    loading="lazy"
                    className="h-9 w-9 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by 5,000+ patients
                </p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-fade-up animation-delay-200">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
              <div className="glass relative h-full w-full overflow-hidden rounded-3xl">
                <Image
                  src="/assets/docm.png"
                  alt="Doctor"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-contain p-6"
                />
              </div>
              {/* Floating health-score card */}
              <div className="glass absolute -bottom-5 -left-5 animate-float rounded-2xl p-4 shadow-glow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <HeartPulse className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold leading-none">82</p>
                    <p className="text-xs text-muted-foreground">Health score</p>
                  </div>
                </div>
              </div>
              {/* Floating AI summary card */}
              <div className="glass absolute -right-4 -top-2 animate-float rounded-2xl p-4 shadow-glow-sm [animation-delay:1.5s]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-none">
                      AI summary ready
                    </p>
                    <p className="text-xs text-muted-foreground">
                      results explained
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our process
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            How Labeasy <span className="text-gradient-primary">works</span>
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow-sm"
            >
              <span className="pointer-events-none absolute right-4 top-3 text-5xl font-bold leading-none text-secondary/40 transition-colors group-hover:text-primary/10">
                {i + 1}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-6 pr-8 text-lg font-semibold">
                {step.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Everything you get */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Everything you get
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              More than a booking app —{" "}
              <span className="text-gradient-primary">a health companion</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              From the moment you book to long after your results arrive, Labeasy
              helps you save money and stay on top of your health.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health intelligence highlight */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Health intelligence
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Your results, finally{" "}
              <span className="text-gradient-primary">made clear</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Every report is turned into a plain-language summary, a health
              score, and trends you can actually follow — with the right
              specialist suggested when something needs attention.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "AI-written summaries that flag what matters",
                "Per-marker trends across all your reports",
                "Nearby specialists matched to your results",
                "Reminders so follow-up tests never slip",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="gradient" size="lg" className="mt-8">
              <Link href="/results">
                View your dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mock dashboard card */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-16 w-16 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="h-16 w-16 -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="10" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#34d399" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${0.82 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`} />
                    </svg>
                    <span className="absolute text-lg font-bold">82</span>
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">Health score</p>
                    <p className="font-semibold text-emerald-400">Good</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> AI
                </Badge>
              </div>

              <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm leading-relaxed">
                  Most markers look healthy. Your{" "}
                  <span className="font-medium">Vitamin D</span> is a little low —
                  worth a chat with a physician.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { k: "Hemoglobin", v: "14.2", ok: true },
                  { k: "TSH", v: "6.5", ok: false },
                  { k: "Vitamin D", v: "18", ok: false },
                ].map((m) => (
                  <div key={m.k} className="rounded-xl border border-border bg-card p-3">
                    <p className="truncate text-xs text-muted-foreground">{m.k}</p>
                    <p className="mt-1 text-lg font-bold">{m.v}</p>
                    <span
                      className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${
                        m.ok ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div className="text-sm">
                  <p className="font-medium">Dr. Mehta · Endocrinologist</p>
                  <p className="text-xs text-muted-foreground">2.1 km away</p>
                </div>
                <Button size="sm" variant="outline" className="ml-auto">
                  Book
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 text-center sm:p-8">
                <p className="text-3xl font-bold text-gradient-primary sm:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For labs */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-14">
          <div className="absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4 gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> For labs, doctors & insurers
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Run a lab, clinic, or insurer?{" "}
                <span className="text-gradient-primary">Grow with Labeasy.</span>
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                List your tests, consults, or plans; manage bookings; and get paid
                — all from one dashboard, with analytics, featured promotion, and a
                settlement wallet built in.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="gradient">
                  <Link href="/signuplab">List a lab <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signupdoctor">Join as a doctor</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signupinsurance">Partner as an insurer</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {PARTNER_PERKS.map((perk) => (
                <div
                  key={perk.label}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <perk.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium">{perk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 spotlight opacity-70" />
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
            Book your test today.{" "}
            <span className="text-gradient-primary">Start your health journey.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Book tests, consult doctors, and get insured — save on every step and
            finally understand what your results mean.
          </p>
          <div className="mt-8 flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
            <Button asChild variant="gradient" size="lg">
              <Link href="/tests">
                Book a test
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/doctors">Find a doctor</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/insurance">Explore insurance</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
