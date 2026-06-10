"use client";

import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Discover",
    links: [
      { label: "Browse tests", href: "/tests" },
      { label: "Find labs", href: "/labs" },
      { label: "Find doctors", href: "/doctors" },
      { label: "Insurance plans", href: "/insurance" },
    ],
  },
  {
    title: "For partners",
    links: [
      { label: "Partner as a lab", href: "/signuplab" },
      { label: "Join as a doctor", href: "/signupdoctor" },
      { label: "Register as insurer", href: "/signupinsurance" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" aria-label="Labeasy home">
              <Image
                src="/assets/logocbs.png"
                alt="Labeasy"
                width={150}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Compare labs and book tests, consult doctors, and buy health
              insurance — all in one place.
            </p>
          </div>

          {/* Link sections */}
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Labeasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
