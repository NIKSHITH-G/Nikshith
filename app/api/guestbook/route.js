// The rooftop guestbook. Visitors leave a short note; it stays hidden until the
// owner approves it, so nothing a stranger writes appears on the site unreviewed.
import { randomUUID } from "node:crypto";
import { get, cas, throttle, clientId } from "../../../lib/kv";
import { isOwner } from "../../../lib/owner";

export const dynamic = "force-dynamic";

const KEY = "guestbook";
const MAX_NOTES = 300;
const COLORS = ["#fde68a", "#fbcfe8", "#bbf7d0", "#bfdbfe", "#ddd6fe", "#fed7aa"];

const clean = (v, max) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

async function load() {
  const raw = await get(KEY);
  return { raw, notes: raw ? JSON.parse(raw) : [] };
}

// Retry a read-modify-write a few times in case two people post at once.
async function update(fn) {
  for (let i = 0; i < 4; i++) {
    const { raw, notes } = await load();
    const next = fn(notes);
    if (await cas(KEY, raw, JSON.stringify(next))) return next;
  }
  throw new Error("busy");
}

const publicView = (notes) =>
  notes.filter((n) => n.approved).map(({ id, name, message, color, at }) => ({ id, name, message, color, at }));

export async function GET(request) {
  const { notes } = await load();
  const owner = isOwner(request);
  return Response.json(
    { notes: owner ? notes : publicView(notes), owner, pending: owner ? notes.filter((n) => !n.approved).length : undefined },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const owner = isOwner(request);

  // owner moderation: approve or delete a note
  if (body.action === "approve" || body.action === "delete") {
    if (!owner) return Response.json({ error: "Only Nikshith can moderate notes." }, { status: 403 });
    try {
      const notes = await update((all) =>
        body.action === "delete" ? all.filter((n) => n.id !== body.id) : all.map((n) => (n.id === body.id ? { ...n, approved: true } : n))
      );
      return Response.json({ notes, owner: true });
    } catch {
      return Response.json({ error: "Busy, try again." }, { status: 409 });
    }
  }

  // a visitor leaving a note
  if (body.website) return Response.json({ ok: true }); // honeypot field: bots fill it, people never see it
  const name = clean(body.name, 40);
  const message = clean(body.message, 280);
  if (!name || message.length < 2) return Response.json({ error: "Add your name and a message." }, { status: 400 });
  if (!owner && !(await throttle("guestbook", clientId(request), 60))) {
    return Response.json({ error: "One note a minute, please." }, { status: 429 });
  }
  const note = {
    id: randomUUID(),
    name,
    message,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    at: Date.now(),
    approved: owner, // the owner's own notes go straight up
  };
  try {
    await update((all) => [note, ...all].slice(0, MAX_NOTES));
  } catch {
    return Response.json({ error: "Busy, try again." }, { status: 409 });
  }
  return Response.json({ ok: true, pending: !note.approved });
}
