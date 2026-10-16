// Tiny key-value layer for the shared bits of the studio (chess game, coffee counter).
//
// In production this talks to Upstash Redis — add it from the Vercel Marketplace and
// it sets KV_REST_API_URL / KV_REST_API_TOKEN for you (the UPSTASH_REDIS_REST_* names
// work too). Without those env vars it falls back to an in-memory store, which is fine
// for local dev but resets on every deploy/cold start and isn't shared between servers.
import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const persistent = Boolean(url && token);
const redis = persistent ? new Redis({ url, token, automaticDeserialization: false }) : null;

// survives Next's hot reloads in dev
const mem = (globalThis.__studioKv ??= new Map());
const memGet = (key) => {
  const e = mem.get(key);
  if (!e) return null;
  if (e.exp && e.exp < Date.now()) {
    mem.delete(key);
    return null;
  }
  return e.val;
};

export async function get(key) {
  if (redis) return (await redis.get(key)) ?? null;
  return memGet(key);
}

export async function set(key, val, { ex, nx } = {}) {
  if (redis) {
    const opts = {};
    if (ex) opts.ex = ex;
    if (nx) opts.nx = true;
    const res = await redis.set(key, val, opts);
    return res === "OK";
  }
  if (nx && memGet(key) !== null) return false;
  mem.set(key, { val: String(val), exp: ex ? Date.now() + ex * 1000 : 0 });
  return true;
}

export async function incr(key) {
  if (redis) return redis.incr(key);
  const n = Number(memGet(key) ?? 0) + 1;
  mem.set(key, { val: String(n), exp: 0 });
  return n;
}

export async function del(key) {
  if (redis) return redis.del(key);
  mem.delete(key);
}

// Compare-and-set: only writes `next` if the key still holds `expected` (null = missing).
// Stops two visitors' moves from clobbering each other.
const CAS = `
local cur = redis.call('GET', KEYS[1])
if (cur == false and ARGV[1] == '') or cur == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2])
  return 1
end
return 0`;

export async function cas(key, expected, next) {
  if (redis) return (await redis.eval(CAS, [key], [expected ?? "", next])) === 1;
  if (memGet(key) !== expected) return false;
  mem.set(key, { val: next, exp: 0 });
  return true;
}

// Best-effort per-visitor throttle. Returns true if the action is allowed.
export async function throttle(scope, id, seconds) {
  return set(`rl:${scope}:${id}`, "1", { ex: seconds, nx: true });
}

export function clientId(request) {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "anon";
}
