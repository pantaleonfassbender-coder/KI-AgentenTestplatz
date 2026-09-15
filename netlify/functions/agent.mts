/* Agenten-Abstraktionsschicht (MVRP-Layer 5).
   Einheitliche Schnittstelle zu Anthropic (Claude), OpenAI (GPT) und Google (Gemini).
   POST /api/agent  { provider, system, messages:[{role:"user"|"assistant", content}], maxTokens? }
   ->               { text, model, provider, latencyMs, usage? }
   Schluessel via Netlify-Env (bzw. Netlify AI Gateway): ANTHROPIC_API_KEY / OPENAI_API_KEY /
   GEMINI_API_KEY. Modelle ueberschreibbar via ANTHROPIC_MODEL / OPENAI_MODEL / GEMINI_MODEL.
   Zeitbudget 22 s (synchrone Netlify Functions brechen bei max. 26 s ab). */

const MAX_MESSAGES = 40;
const MAX_TOTAL_CHARS = 48000;
const MAX_SYSTEM_CHARS = 12000;
const DEFAULT_MAX_TOKENS = 1600;
const TIMEOUT_MS = 22000;

const MODELS: Record<string, string> = {
  anthropic: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
  openai: process.env.OPENAI_MODEL || "gpt-5",
  gemini: process.env.GEMINI_MODEL || "gemini-2.5-flash",
};

type Msg = { role: "user" | "assistant"; content: string };

function bad(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function callAnthropic(system: string, messages: Msg[], maxTokens: number) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY fehlt (Netlify-Env oder AI Gateway).");
  const base = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  const res = await fetchWithTimeout(`${base}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODELS.anthropic, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = (data.content || [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
  return { text, model: data.model || MODELS.anthropic, usage: data.usage || null };
}

async function callOpenAI(system: string, messages: Msg[], maxTokens: number) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY fehlt (Netlify-Env oder AI Gateway).");
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com";
  const res = await fetchWithTimeout(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODELS.openai,
      max_completion_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return { text, model: data.model || MODELS.openai, usage: data.usage || null };
}

async function callGemini(system: string, messages: Msg[], maxTokens: number) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY fehlt (Netlify-Env oder AI Gateway).");
  const base = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetchWithTimeout(
    `${base}/v1beta/models/${MODELS.gemini}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          // Denk-Token zaehlen gegen maxOutputTokens; ohne Deckelung drohen leere Antworten.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const cand = data.candidates?.[0];
  const finish = cand?.finishReason;
  const text = (cand?.content?.parts || [])
    .map((p: { text?: string }) => p.text || "")
    .join("");
  if (!text && finish && finish !== "STOP") {
    throw new Error(`Gemini lieferte keinen Text (finishReason: ${finish}).`);
  }
  return { text, model: MODELS.gemini, usage: data.usageMetadata || null };
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return bad(405, "Nur POST.");

  let body: {
    provider?: string; system?: string;
    messages?: Msg[]; maxTokens?: number;
  };
  try {
    body = await req.json();
  } catch {
    return bad(400, "Ungültiges JSON.");
  }

  const provider = body.provider;
  if (provider !== "anthropic" && provider !== "openai" && provider !== "gemini") {
    return bad(400, "provider muss anthropic, openai oder gemini sein.");
  }

  const system = typeof body.system === "string" ? body.system : "";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (system.length > MAX_SYSTEM_CHARS) return bad(400, "Systemprompt zu lang.");
  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    return bad(400, `messages: 1 bis ${MAX_MESSAGES} Einträge.`);
  }
  let total = system.length;
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) {
      return bad(400, "Jede Nachricht braucht role (user/assistant) und content.");
    }
    total += m.content.length;
  }
  if (total > MAX_TOTAL_CHARS) return bad(400, `Gesamtlänge über ${MAX_TOTAL_CHARS} Zeichen.`);
  if (messages[messages.length - 1].role !== "user") {
    return bad(400, "Letzte Nachricht muss von der Person stammen (role: user).");
  }

  const maxTokens = Math.min(Math.max(Number(body.maxTokens) || DEFAULT_MAX_TOKENS, 256), 4000);

  const started = Date.now();
  try {
    const call = provider === "anthropic" ? callAnthropic : provider === "openai" ? callOpenAI : callGemini;
    const result = await call(system, messages, maxTokens);
    return Response.json({
      provider,
      text: result.text,
      model: result.model,
      usage: result.usage,
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const timeout = /abort/i.test(msg);
    return Response.json(
      { error: timeout ? "Zeitüberschreitung beim Modellaufruf (22 s)." : msg },
      { status: timeout ? 504 : 502 }
    );
  }
};

export const config = { path: "/api/agent" };
