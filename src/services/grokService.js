// Thin wrapper around the Grok (xAI) chat completions API.
// Docs: https://docs.x.ai/docs/api-reference
//
// Requires GROK_API_KEY in your .env file. Get one at https://console.x.ai

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

async function analyzeApplication({ applicantName, scheme, reason, comparison }) {
  if (!process.env.GROK_API_KEY) {
    const err = new Error(
      "GROK_API_KEY is not set. Add it to your .env file to enable live AI analysis."
    );
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const comparisonText = comparison
    ? `Application A: ${comparison.applicationA || "n/a"}. Application B: ${comparison.applicationB || "n/a"}.`
    : "No side-by-side comparison data available.";

  const prompt = `You are a fraud-review assistant for a government welfare platform in Bangladesh.
Analyze the following flagged application and respond in strict JSON with two fields:
"riskLevel" (must be exactly "Low", "Medium", or "High") and "explanation" (2-3 sentences,
plain language, explaining what looks suspicious or why the flag may be a false positive).
Do not make a final approve/reject decision — that is always made by a human officer.

Applicant: ${applicantName}
Scheme: ${scheme}
System-flagged reason: ${reason}
${comparisonText}`;

  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`
    },
    body: JSON.stringify({
      model: "grok-4-fast",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(`Grok API request failed (${response.status}): ${bodyText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Grok API returned an unexpected response shape.");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Grok API did not return valid JSON.");
  }

  const allowedLevels = ["Low", "Medium", "High"];
  if (!allowedLevels.includes(parsed.riskLevel)) {
    throw new Error(`Grok returned an unexpected riskLevel: ${parsed.riskLevel}`);
  }

  return {
    riskLevel: parsed.riskLevel,
    explanation: parsed.explanation
  };
}

module.exports = { analyzeApplication };
