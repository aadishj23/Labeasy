"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  CalendarCheck,
  FileText,
  Network,
  ShieldCheck,
  Wallet,
  Star,
  Sparkles,
  Activity,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    icon: Search,
    title: "Search",
    description: "Find diagnostic tests and accredited labs near you in seconds.",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    description: "Compare prices and book your test with your preferred lab.",
  },
  {
    icon: FileText,
    title: "Get results",
    description: "Receive your reports digitally, stored securely and always accessible.",
  },
];

const FEATURES = [
  {
    icon: Network,
    title: "Wide lab network",
    description:
      "Access a vast network of NABL-accredited diagnostic labs across the city.",
  },
  {
    icon: ShieldCheck,
    title: "Secure digital reports",
    description:
      "Your results are stored securely and accessible anytime, from anywhere.",
  },
  {
    icon: Wallet,
    title: "Best prices",
    description:
      "Compare prices across labs and unlock exclusive discounts on every test.",
  },
];

const STATS = [
  { value: 50, suffix: "+", label: "Partner labs" },
  { value: 1000, suffix: "+", label: "Tests available" },
  { value: 5000, suffix: "+", label: "Happy customers" },
  { value: 98, suffix: "%", label: "Satisfaction" },
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
              NABL-accredited labs, one platform
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Diagnostic tests,{" "}
              <span className="text-gradient-primary">simplified.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover a healthier you with real-time lab bookings, personalised
              recommendations, and secure report storage that tracks your health
              milestones effortlessly.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gradient" size="lg">
                <Link href="/tests">
                  Book a test
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/tests">Explore tests</Link>
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
              {/* Floating rating card */}
              <div className="glass absolute -bottom-5 -left-5 animate-float rounded-2xl p-4 shadow-glow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Star className="h-5 w-5 fill-current" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold leading-none">4.9</p>
                    <p className="text-xs text-muted-foreground">1,000+ reviews</p>
                  </div>
                </div>
              </div>
              {/* Floating report card */}
              <div className="glass absolute -right-4 top-8 animate-float rounded-2xl p-4 shadow-glow-sm [animation-delay:1.5s]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Activity className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-none">Report ready</p>
                    <p className="text-xs text-muted-foreground">in 12 hours</p>
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
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-glow-sm"
            >
              <span className="absolute right-5 top-4 text-6xl font-bold text-secondary/60 transition-colors group-hover:text-primary/10">
                {i + 1}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Why choose us
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Your health, our priority
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                We make diagnostic testing simple, accessible, and affordable for
                everyone. With Labeasy, quality healthcare is just a click away.
              </p>
              <div className="mt-8 space-y-4">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/30"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-6 text-center sm:p-8"
                >
                  <p className="text-3xl font-bold text-gradient-primary sm:text-4xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 spotlight opacity-70" />
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
            Book your test today.{" "}
            <span className="text-gradient-primary">Start your health journey.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Get access to the best diagnostic labs in your city and take the first
            step towards better health monitoring.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild variant="gradient" size="lg">
              <Link href="/tests">
                Book a test
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
