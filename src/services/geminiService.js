// Uses Google's Gemini API (free tier, no credit card required) via the
// Interactions API to generate a fraud risk analysis.
// Get a key at https://aistudio.google.com/apikey
//
// Google retires Gemini model versions frequently — if this model name ever
// stops working, check https://ai.google.dev/gemini-api/docs/changelog for
// the current stable "Flash" model name and swap it into GEMINI_MODEL below.

const GEMINI_MODEL = "gemini-3.6-flash";
const INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

async function analyzeApplication({ applicantName, scheme, reason, comparison }) {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error(
      "GEMINI_API_KEY is not set. Add it to your .env file to enable live AI analysis."
    );
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const comparisonText = comparison
    ? `Application A: ${comparison.applicationA || "n/a"}. Application B: ${comparison.applicationB || "n/a"}.`
    : "No side-by-side comparison data available.";

  const prompt = `You are a fraud-review assistant for a government welfare platform in Bangladesh.
Analyze the following flagged application and respond with ONLY a JSON object (no markdown
formatting, no code fences, no extra text) with exactly two fields:
"riskLevel" (must be exactly "Low", "Medium", or "High") and "explanation" (2-3 sentences,
plain language, explaining what looks suspicious or why the flag may be a false positive).
Do not make a final approve/reject decision — that is always made by a human officer.

Applicant: ${applicantName}
Scheme: ${scheme}
System-flagged reason: ${reason}
${comparisonText}`;

  const response = await fetch(`${INTERACTIONS_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Revision": "2026-05-20"
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      input: prompt
    })
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(`Gemini API request failed (${response.status}): ${bodyText}`);
  }

  const data = await response.json();

  // Pull the model's text output out of the Interactions API's steps array.
  const outputStep = data.steps?.find((s) => s.type === "model_output");
  const rawText = outputStep?.content?.find((c) => c.type === "text")?.text;

  if (!rawText) {
    throw new Error("Gemini API returned an unexpected response shape.");
  }

  // Strip accidental markdown code fences before parsing, just in case.
  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini API did not return valid JSON.");
  }

  const allowedLevels = ["Low", "Medium", "High"];
  if (!allowedLevels.includes(parsed.riskLevel)) {
    throw new Error(`Gemini returned an unexpected riskLevel: ${parsed.riskLevel}`);
  }

  return {
    riskLevel: parsed.riskLevel,
    explanation: parsed.explanation
  };
}

module.exports = { analyzeApplication };
