// The numbers behind /stats. Owner only (CHESS_OWNER_KEY in the x-owner-key header).
import { isOwner } from "../../../lib/owner";
import { report } from "../../../lib/stats";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isOwner(request)) return Response.json({ error: "Owner key required" }, { status: 401 });
  return Response.json(await report(30));
}
