// Privacy-friendly visitor stats for the private /stats page: plain counters
// (no cookies, no IPs, no names stored) plus the questions people ask AI Nikshith.
import { getMany, incr, logPush, logRange } from "./kv";

export const PANELS = [
  "about", "experience", "education", "projects", "skills", "certs", "music", "photos", "contact", "github",
  "library", "now", "ask", "elevator", "learning", "photobooth", "treadmill", "bag", "snooker", "chess",
  "arcade", "kanban", "telescope", "radio", "guestbook",
];
export const FLOORS = ["studio", "gym", "games", "roof"];
// what a counter is about → the ids it may carry
export const EVENTS = { visit: ["studio", "classic"], enter: ["studio"], explored: ["all"], panel: PANELS, floor: FLOORS };
// how a question was answered
export const HOW = ["built-in", "ai", "unknown"];

const day = (d = new Date()) => d.toISOString().slice(0, 10);

export async function track(type, id) {
  if (!EVENTS[type]?.includes(id)) return false;
  await Promise.all([incr(`st:${type}:${id}`), incr(`st:d:${day()}:${type}:${id}`)]);
  return true;
}

export async function logQuestion(q, how) {
  const text = String(q ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  if (!text || !HOW.includes(how)) return;
  await Promise.all([
    logPush("st:questions", JSON.stringify({ q: text, how, t: Date.now() }), 500),
    incr(`st:q:${how}`),
    incr(`st:d:${day()}:question:all`),
  ]);
}

export async function report(days = 30) {
  const dates = Array.from({ length: days }, (_, i) => day(new Date(Date.now() - (days - 1 - i) * 86400000)));
  const totalKeys = Object.entries(EVENTS).flatMap(([type, ids]) => ids.map((id) => `st:${type}:${id}`));
  const dailyKeys = dates.flatMap((d) => [`st:d:${d}:visit:studio`, `st:d:${d}:visit:classic`, `st:d:${d}:enter:studio`, `st:d:${d}:question:all`]);
  const howKeys = HOW.map((h) => `st:q:${h}`);
  const [totals, daily, hows, raw] = await Promise.all([getMany(totalKeys), getMany(dailyKeys), getMany(howKeys), logRange("st:questions", 200)]);

  const counts = {};
  totalKeys.forEach((k, i) => {
    const [, type, id] = k.split(":");
    (counts[type] ??= {})[id] = totals[i];
  });
  return {
    counts,
    daily: dates.map((d, i) => ({ day: d, studio: daily[i * 4], classic: daily[i * 4 + 1], entered: daily[i * 4 + 2], questions: daily[i * 4 + 3] })),
    answers: Object.fromEntries(HOW.map((h, i) => [h, hows[i]])),
    questions: raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r)),
  };
}
