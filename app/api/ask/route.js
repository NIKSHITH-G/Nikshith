// "AI Nikshith" chat. Answers with Google Gemini (free tier) when GEMINI_API_KEY is
// set, and falls back to the built-in matcher in lib/persona.js whenever there's no
// key, the free quota is used up, or Gemini is down — so it never costs money and
// never goes silent.
import { SYSTEM_PROMPT, answerOffline, matchOffline } from "../../../lib/persona";
import { bump, clientId } from "../../../lib/kv";

export const dynamic = "force-dynamic";

// Tried in order: the free tier sometimes reports "high demand" on one model while
// another is fine. GEMINI_MODEL (comma-separated) overrides the list.
const MODELS = (process.env.GEMINI_MODEL || "gemini-3.5-flash,gemini-flash-lite-latest").split(",").map((m) => m.trim());
const BUDGET_MS = 4000; // nobody waits longer than this: after it, the built-in engine answers
const PER_MODEL_MS = 3000;
const PER_VISITOR_PER_HOUR = 40; // messages
const LLM_PER_DAY = 400; // stays well inside Gemini's free daily limit
const MAX_TURNS = 8; // conversation history sent to the model
const MAX_CHARS = 500; // per message

const clean = (t) => String(t ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, MAX_CHARS);

async function callModel(model, key, history, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: history.map((m) => ({ role: m.role === "me" ? "model" : "user", parts: [{ text: m.text }] })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 400, thinkingConfig: { thinkingLevel: "low" } },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // skip any "thought" parts; keep only what he actually says
    const text = data?.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function askGemini(history) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const today = new Date().toISOString().slice(0, 10);
  if ((await bump(`ask:llm:${today}`, 86400)) > LLM_PER_DAY) return null;
  const started = Date.now();
  for (const model of MODELS) {
    const left = BUDGET_MS - (Date.now() - started);
    if (left < 1200) break;
    const text = await callModel(model, key, history, Math.min(left, PER_MODEL_MS));
    if (text) return { text, model };
  }
  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role === "me" ? "me" : "visitor", text: clean(m.text) }))
    .filter((m) => m.text);
  const question = history.findLast((m) => m.role === "visitor")?.text;
  if (!question) return Response.json({ error: "Ask me something!" }, { status: 400 });

  if ((await bump(`ask:ip:${clientId(request)}`, 3600)) > PER_VISITOR_PER_HOUR) {
    return Response.json({ reply: "I need a breather — that's a lot of questions! Try again in a bit, or email me.", source: "limit" }, { status: 429 });
  }

  // clear, direct questions don't need an LLM: answer them instantly
  if (matchOffline(question).confident) return Response.json({ reply: answerOffline(question), source: "built-in" });
  const llm = await askGemini(history);
  if (llm) return Response.json({ reply: llm.text, source: llm.model });
  return Response.json({ reply: answerOffline(question), source: "built-in" });
}
