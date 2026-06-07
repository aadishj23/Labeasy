import { geminiJSON, geminiJSONParts } from "@/lib/gemini";
import { SPECIALTIES, suggestSpecialties } from "@/lib/doctor-suggestions";

export type Analyte = {
  name: string;
  value: number;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
  flag: "low" | "high" | "normal" | null;
};

export type AISummary = {
  summary: string;
  highlights: { name: string; status: string; note: string }[];
  suggestedSpecialties: string[];
  ai: boolean;
};

export function flagOf(v: number, low: number | null, high: number | null) {
  if (low != null && v < low) return "low" as const;
  if (high != null && v > high) return "high" as const;
  if (low != null || high != null) return "normal" as const;
  return null;
}

// Normalize a raw results row ({ name, value, unit, ref_low, ref_high }).
function toAnalyte(a: any): Analyte | null {
  const value = Number(a?.value);
  if (!a?.name || !Number.isFinite(value)) return null;
  const low = a.ref_low != null ? Number(a.ref_low) : null;
  const high = a.ref_high != null ? Number(a.ref_high) : null;
  return {
    name: String(a.name),
    value,
    unit: a.unit ?? null,
    ref_low: Number.isFinite(low as number) ? low : null,
    ref_high: Number.isFinite(high as number) ? high : null,
    flag: flagOf(value, low, high),
  };
}

function rowsOf(results: any): any[] {
  return Array.isArray(results) ? results : results?.analytes ?? [];
}

// Latest value per analyte across many reports (sorted oldest -> newest).
export function analytesFromReports(reports: any[]): Analyte[] {
  const map = new Map<string, Analyte>();
  const sorted = [...reports].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  for (const rep of sorted) {
    for (const row of rowsOf(rep.results)) {
      const a = toAnalyte(row);
      if (a) map.set(a.name, a);
    }
  }
  return [...map.values()];
}

// Analytes from a single report's results.
export function analytesFromResults(results: any): Analyte[] {
  const out: Analyte[] = [];
  for (const row of rowsOf(results)) {
    const a = toAnalyte(row);
    if (a) out.push(a);
  }
  return out;
}

export function fallbackSummary(analytes: Analyte[]): AISummary {
  const abnormal = analytes.filter((a) => a.flag === "low" || a.flag === "high");
  const highlights = abnormal.map((a) => ({
    name: a.name,
    status: a.flag as string,
    note: `${a.value}${a.unit ? ` ${a.unit}` : ""} is ${
      a.flag === "high" ? "above" : "below"
    } the typical range${
      a.ref_low != null && a.ref_high != null
        ? ` (${a.ref_low}–${a.ref_high})`
        : ""
    }.`,
  }));
  const summary =
    abnormal.length === 0
      ? "All measured markers are within their typical reference ranges. Keep up your healthy habits and re-test as advised."
      : `${abnormal.length} of ${analytes.length} markers are outside their typical range: ${abnormal
          .map((a) => a.name)
          .join(", ")}. Consider discussing these with a doctor.`;
  return {
    summary,
    highlights,
    suggestedSpecialties: suggestSpecialties(abnormal.map((a) => a.name)),
    ai: false,
  };
}

// Generate an AI summary via Gemini 2.5-flash; fall back to a rule-based one.
export async function generateAISummary(analytes: Analyte[]): Promise<AISummary> {
  if (analytes.length === 0) {
    return { summary: "", highlights: [], suggestedSpecialties: [], ai: false };
  }
  try {
    const table = analytes
      .map(
        (a) =>
          `- ${a.name}: ${a.value}${a.unit ? ` ${a.unit}` : ""} (ref ${
            a.ref_low ?? "?"
          }–${a.ref_high ?? "?"}, ${a.flag ?? "n/a"})`
      )
      .join("\n");

    const prompt = `You are a friendly health assistant for a diagnostics marketplace in India. A patient's lab markers are below. Write a brief, reassuring, plain-language overview. Never diagnose or prescribe; encourage consulting a doctor for anything abnormal.

Markers:
${table}

Return STRICT JSON with this shape:
{
  "summary": "2-4 sentence plain-language overview, friendly and non-alarming",
  "highlights": [{ "name": "marker name", "status": "high" | "low", "note": "one short sentence explaining it simply" }],
  "suggestedSpecialties": ["..."]
}
Only include highlights for markers that are high or low. Choose suggestedSpecialties ONLY from this list and only those relevant to the abnormal markers (empty array if all normal): ${JSON.stringify(
      SPECIALTIES
    )}.`;

    const out = await geminiJSON<{
      summary: string;
      highlights: { name: string; status: string; note: string }[];
      suggestedSpecialties: string[];
    }>(prompt, "gemini-2.5-flash");

    const summary = String(out.summary || "").trim();
    if (!summary) throw new Error("empty summary");

    return {
      summary,
      highlights: Array.isArray(out.highlights) ? out.highlights : [],
      suggestedSpecialties: (Array.isArray(out.suggestedSpecialties)
        ? out.suggestedSpecialties
        : []
      ).filter((s) => SPECIALTIES.includes(s)),
      ai: true,
    };
  } catch (e) {
    console.error("AI summary generation failed:", e);
    return fallbackSummary(analytes);
  }
}

export type RawResult = {
  name: string;
  value: number;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
};

// Extract structured analyte rows from a report file (PDF/image) via Gemini.
// Best-effort: returns [] on any failure so it never blocks the upload.
export async function extractAnalytes(
  base64: string,
  mimeType: string
): Promise<RawResult[]> {
  try {
    const prompt = `You are given a diagnostic lab report. Extract EVERY measurable analyte/marker that has a numeric result. Use the reference range printed on the report when available.

Return STRICT JSON:
{ "results": [{ "name": string, "value": number, "unit": string | null, "ref_low": number | null, "ref_high": number | null }] }

Rules:
- value, ref_low, ref_high must be plain numbers (no units, no symbols). Use null for an unknown reference bound.
- Skip qualitative rows that have no numeric value (e.g. "Positive", blood group).
- Return an empty results array if there are no numeric markers.`;

    const out = await geminiJSONParts<{ results: any[] }>(
      [{ inlineData: { mimeType, data: base64 } }, { text: prompt }],
      "gemini-2.5-flash"
    );

    const rows = Array.isArray(out.results) ? out.results : [];
    return rows
      .map((r) => {
        const low = r.ref_low != null ? Number(r.ref_low) : null;
        const high = r.ref_high != null ? Number(r.ref_high) : null;
        return {
          name: String(r.name ?? "").trim(),
          value: Number(r.value),
          unit: r.unit ? String(r.unit).trim() : null,
          ref_low: Number.isFinite(low as number) ? low : null,
          ref_high: Number.isFinite(high as number) ? high : null,
        };
      })
      .filter((r) => r.name && Number.isFinite(r.value));
  } catch (e) {
    console.error("Analyte extraction failed:", e);
    return [];
  }
}

// Summarize a report PDF directly via Gemini's multimodal input.
export async function generatePdfSummary(fileUrl: string): Promise<AISummary> {
  const empty: AISummary = {
    summary: "",
    highlights: [],
    suggestedSpecialties: [],
    ai: false,
  };
  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error(`fetch pdf ${resp.status}`);
    const mimeType = resp.headers.get("content-type") || "application/pdf";
    const data = Buffer.from(await resp.arrayBuffer()).toString("base64");

    const prompt = `You are a friendly health assistant for a diagnostics marketplace in India. The attached file is a patient's lab report. Read it and write a brief, reassuring, plain-language overview. Never diagnose or prescribe; encourage consulting a doctor for anything abnormal.

Return STRICT JSON with this shape:
{
  "summary": "2-4 sentence plain-language overview, friendly and non-alarming",
  "highlights": [{ "name": "marker or finding", "status": "high" | "low" | "note", "note": "one short sentence explaining it simply" }],
  "suggestedSpecialties": ["..."]
}
Only include highlights for findings that are abnormal or noteworthy. Choose suggestedSpecialties ONLY from this list and only those relevant (empty array if all normal): ${JSON.stringify(
      SPECIALTIES
    )}.`;

    const out = await geminiJSONParts<{
      summary: string;
      highlights: { name: string; status: string; note: string }[];
      suggestedSpecialties: string[];
    }>(
      [{ inlineData: { mimeType, data } }, { text: prompt }],
      "gemini-2.5-flash"
    );

    const summary = String(out.summary || "").trim();
    if (!summary) return empty;
    return {
      summary,
      highlights: Array.isArray(out.highlights) ? out.highlights : [],
      suggestedSpecialties: (Array.isArray(out.suggestedSpecialties)
        ? out.suggestedSpecialties
        : []
      ).filter((s) => SPECIALTIES.includes(s)),
      ai: true,
    };
  } catch (e) {
    console.error("PDF summary generation failed:", e);
    return empty;
  }
}
