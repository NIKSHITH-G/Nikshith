// The shared chess game on the games floor: "The World vs Nikshith".
//   - Anyone can make White's move (visitors play together as "the world").
//   - Only the owner can make Black's move or reset the board.
// The owner proves who they are with CHESS_OWNER_KEY (set it in Vercel env vars),
// sent as the x-owner-key header. Every move is validated here with chess.js.
import { timingSafeEqual } from "node:crypto";
import { Chess } from "chess.js";
import { get, cas, throttle, clientId, persistent } from "../../../lib/kv";

export const dynamic = "force-dynamic";

const KEY = "chess:game";
const WORLD = "w";
const MAX_HISTORY = 400;

function fresh(gameNo = 1) {
  return { fen: new Chess().fen(), history: [], gameNo, updatedAt: Date.now() };
}

function isOwner(request) {
  const expected = process.env.CHESS_OWNER_KEY;
  const given = request.headers.get("x-owner-key") || "";
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function load() {
  const raw = await get(KEY);
  return { raw, state: raw ? JSON.parse(raw) : fresh() };
}

function view(state) {
  const game = new Chess(state.fen);
  return {
    ...state,
    turn: game.turn(),
    check: game.inCheck(),
    over: game.isGameOver(),
    result: game.isCheckmate() ? (game.turn() === "w" ? "Black wins" : "White wins") : game.isDraw() ? "Draw" : null,
    persistent,
  };
}

export async function GET(request) {
  const { state } = await load();
  return Response.json({ ...view(state), owner: isOwner(request) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const owner = isOwner(request);

  // owner check-in: lets the client confirm a key without doing anything
  if (body.action === "whoami") return Response.json({ owner });

  if (body.action === "reset") {
    if (!owner) return Response.json({ error: "Only Nikshith can reset the board." }, { status: 403 });
    for (let tries = 0; tries < 3; tries++) {
      const { raw, state } = await load();
      const next = fresh((state.gameNo || 1) + 1);
      if (await cas(KEY, raw, JSON.stringify(next))) return Response.json(view(next));
    }
    return Response.json({ error: "Busy, try again." }, { status: 409 });
  }

  const { from, to, promotion } = body;
  if (typeof from !== "string" || typeof to !== "string" || !/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) {
    return Response.json({ error: "Bad move." }, { status: 400 });
  }

  const { raw, state } = await load();
  const game = new Chess(state.fen);
  if (game.isGameOver()) return Response.json({ error: "Game over — waiting for a reset.", ...view(state) }, { status: 409 });

  const worldTurn = game.turn() === WORLD;
  if (!worldTurn && !owner) {
    return Response.json({ error: "It's Nikshith's move. Check back soon!", ...view(state) }, { status: 409 });
  }
  // visitors share one move at a time; a short cooldown stops one person running the game
  if (worldTurn && !owner && !(await throttle("chess", clientId(request), 20))) {
    return Response.json({ error: "Easy — one move every 20 seconds.", ...view(state) }, { status: 429 });
  }

  let move;
  try {
    move = game.move({ from, to, promotion: ["q", "r", "b", "n"].includes(promotion) ? promotion : "q" });
  } catch {
    return Response.json({ error: "Illegal move.", ...view(state) }, { status: 400 });
  }

  const next = {
    ...state,
    fen: game.fen(),
    history: [...state.history, { san: move.san, from, to, by: worldTurn ? "world" : "nikshith", at: Date.now() }].slice(-MAX_HISTORY),
    updatedAt: Date.now(),
  };
  // someone else moved first? tell this player to refresh
  if (!(await cas(KEY, raw, JSON.stringify(next)))) {
    const { state: latest } = await load();
    return Response.json({ error: "Someone just moved — board updated.", ...view(latest) }, { status: 409 });
  }
  return Response.json(view(next));
}
