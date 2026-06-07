import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import TestsView from "@/views/Tests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse diagnostic tests & compare lab prices | Labeasy",
  description:
    "Browse diagnostic tests — CBC, Thyroid, Vitamin D and more — and compare prices across accredited labs near you. Book online with Labeasy.",
  alternates: { canonical: "/tests" },
};

export default async function TestsPage() {
  let tests: any[] = [];
  let packages: any[] = [];
  try {
    [tests, packages] = await Promise.all([
      prisma.tests.findMany({
        select: {
          id: true,
          test_name: true,
          test_description: true,
          slug: true,
          turnaround_hours: true,
        },
        orderBy: { test_name: "asc" },
      }),
      prisma.package.findMany({
        where: { active: true, lab: { status: "VERIFIED" } },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          mrp: true,
          lab: { select: { lab_name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to load tests for SSR:", error);
  }
  return <TestsView initialTests={tests} initialPackages={packages} />;
}
