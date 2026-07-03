import { NextResponse } from "next/server";
import { isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { zones } from "@/db/schema";
import { FACTIONS, type Control } from "@/lib/game";

export const runtime = "nodejs";

// GET /api/zones → zones possédées (pour colorier la carte) + scoreboard factions.
export async function GET() {
  const owned = await db
    .select({ id: zones.id, name: zones.name, owner: zones.owner })
    .from(zones)
    .where(isNotNull(zones.owner));

  // Scoreboard : nombre de zones possédées + points totaux par faction.
  const all = await db.select({ owner: zones.owner, control: zones.control }).from(zones);
  const board: Record<string, { zones: number; points: number }> = {};
  for (const f of FACTIONS) board[f] = { zones: 0, points: 0 };
  for (const z of all) {
    if (z.owner && board[z.owner]) board[z.owner].zones++;
    for (const [f, v] of Object.entries((z.control as Control) ?? {})) {
      if (board[f]) board[f].points += v;
    }
  }

  return NextResponse.json({ zones: owned, board });
}
