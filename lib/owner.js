import { timingSafeEqual } from "node:crypto";

// True when the request carries the site owner's key (CHESS_OWNER_KEY, sent as x-owner-key).
// Used for the chess board, guestbook moderation, and anything else only Nikshith can do.
export function isOwner(request) {
  const expected = process.env.CHESS_OWNER_KEY;
  const given = request.headers.get("x-owner-key") || "";
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}
