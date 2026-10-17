// Counts what visitors do (rooms opened, floors visited, questions asked) for the
// private /stats page. Nothing identifying is stored; the IP is only used, briefly,
// to stop one visitor flooding the counters.
import { bump, clientId } from "../../../lib/kv";
import { logQuestion, track } from "../../../lib/stats";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if ((await bump(`trk:ip:${clientId(request)}`, 3600)) > 300) return new Response(null, { status: 429 });
  if (body.type === "question") await logQuestion(body.q, body.how);
  else await track(String(body.type), String(body.id));
  return new Response(null, { status: 204 });
}
