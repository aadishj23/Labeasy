import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import {
  analytesFromResults,
  generateAISummary,
  generatePdfSummary,
} from "@/lib/ai-summary";

// AI summary for a single report (cached on the report once generated).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const { id } = await params;

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report || report.user_id !== auth.userID) {
    return Response.json({ message: "Report not found." }, { status: 404 });
  }

  if (report.ai_summary) {
    return Response.json({ ...(report.ai_summary as object), cached: true });
  }

  // Prefer structured results; otherwise summarize the report PDF directly.
  const analytes = analytesFromResults(report.results);
  let result;
  if (analytes.length > 0) {
    result = await generateAISummary(analytes);
  } else if (report.file_url) {
    result = await generatePdfSummary(report.file_url);
  } else {
    return Response.json({
      summary: null,
      message: "This report has no data to summarize.",
    });
  }

  if (!result.summary) {
    return Response.json({
      summary: null,
      message: "Couldn't read this report. Please try again.",
    });
  }

  if (result.ai) {
    await prisma.report.update({
      where: { id },
      data: {
        ai_summary: {
          summary: result.summary,
          highlights: result.highlights,
          suggestedSpecialties: result.suggestedSpecialties,
          ai: true,
        },
      },
    });
  }

  return Response.json({ ...result, cached: false });
}
