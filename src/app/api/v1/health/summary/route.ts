import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { analytesFromReports, generateAISummary } from "@/lib/ai-summary";

export async function POST() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const userId = auth.userID as string;

  const reports = await prisma.report.findMany({
    where: { user_id: userId, results: { not: undefined } },
    select: { results: true, created_at: true },
  });

  const analytes = analytesFromReports(reports);
  if (analytes.length === 0) {
    return Response.json({ summary: null });
  }

  // Cache key from the analyte snapshot.
  const canonical = analytes
    .map((a) => `${a.name}=${a.value}${a.unit ?? ""}[${a.ref_low}-${a.ref_high}]:${a.flag}`)
    .sort()
    .join("|");
  const inputHash = createHash("sha256").update(canonical).digest("hex");

  const cached = await prisma.healthSummary.findUnique({
    where: { user_id: userId },
  });
  if (cached && cached.input_hash === inputHash) {
    return Response.json({
      summary: cached.summary,
      highlights: cached.highlights,
      suggestedSpecialties: cached.suggested_specialties,
      ai: true,
      cached: true,
    });
  }

  const result = await generateAISummary(analytes);

  // Only cache real AI output (so a fallback retries next time).
  if (result.ai) {
    await prisma.healthSummary.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        summary: result.summary,
        highlights: result.highlights,
        suggested_specialties: result.suggestedSpecialties,
        input_hash: inputHash,
      },
      update: {
        summary: result.summary,
        highlights: result.highlights,
        suggested_specialties: result.suggestedSpecialties,
        input_hash: inputHash,
      },
    });
  }

  return Response.json({ ...result, cached: false });
}
