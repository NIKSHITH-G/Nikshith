// Shared counters for little studio interactions (e.g. coffees brewed by visitors).
import { get, incr, throttle, clientId } from "../../../lib/kv";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["coffee"]);

export async function GET(request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!ALLOWED.has(name)) return Response.json({ error: "Unknown counter" }, { status: 404 });
  return Response.json({ count: Number((await get(`count:${name}`)) ?? 0) });
}

export async function POST(request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!ALLOWED.has(name)) return Response.json({ error: "Unknown counter" }, { status: 404 });
  // one brew every few seconds per visitor, so the number means something
  if (!(await throttle(name, clientId(request), 4))) {
    return Response.json({ count: Number((await get(`count:${name}`)) ?? 0), throttled: true });
  }
  return Response.json({ count: await incr(`count:${name}`) });
}
