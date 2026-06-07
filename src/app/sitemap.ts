import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://labeasy.aadishjain.dev";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tests`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/labs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const [tests, labs, packages] = await Promise.all([
      prisma.tests.findMany({ select: { slug: true } }),
      prisma.lab.findMany({
        where: { status: "VERIFIED" },
        select: { slug: true },
      }),
      prisma.package.findMany({
        where: { active: true, lab: { status: "VERIFIED" } },
        select: { slug: true },
      }),
    ]);

    const testRoutes: MetadataRoute.Sitemap = tests
      .filter((t) => t.slug)
      .map((t) => ({
        url: `${BASE_URL}/test/${t.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    const labRoutes: MetadataRoute.Sitemap = labs
      .filter((l) => l.slug)
      .map((l) => ({
        url: `${BASE_URL}/lab/${l.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }));

    const packageRoutes: MetadataRoute.Sitemap = packages
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${BASE_URL}/package/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }));

    return [
      ...staticRoutes,
      ...testRoutes,
      ...labRoutes,
      ...packageRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}
