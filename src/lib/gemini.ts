// Thin Gemini (Google Generative Language API) client — no SDK, just fetch.
// Reused for review generation (seed) and AI report summaries (Phase 6).
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function endpoint(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export async function geminiGenerate(
  prompt: string,
  opts: { json?: boolean; model?: string } = {}
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const model = opts.model || DEFAULT_MODEL;

  const res = await fetch(`${endpoint(model)}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: opts.json
        ? { responseMimeType: "application/json" }
        : {},
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("") ?? ""
  );
}

export async function geminiJSON<T = unknown>(
  prompt: string,
  model?: string
): Promise<T> {
  const text = await geminiGenerate(prompt, { json: true, model });
  return JSON.parse(text) as T;
}
