import { NextResponse } from "next/server";
import { db } from "@/db";
import { zones } from "@/db/schema";
import { FACTIONS, dominant, type Control } from "@/lib/game";

export const runtime = "nodejs";

// GET /api/zones → toutes les zones ayant du contrôle (owner + points par
// faction, pour colorier/afficher la progression) + scoreboard factions.
export async function GET() {
  const all = await db
    .select({ id: zones.id, name: zones.name, owner: zones.owner, control: zones.control })
    .from(zones);

  const board: Record<string, { zones: number; points: number }> = {};
  for (const f of FACTIONS) board[f] = { zones: 0, points: 0 };

  const out = all.map((z) => {
    const control = (z.control as Control) ?? {};
    const lead = dominant(control);
    if (z.owner && board[z.owner]) board[z.owner].zones++;
    for (const [f, v] of Object.entries(control)) if (board[f]) board[f].points += v;
    return { id: z.id, owner: z.owner, lead, control };
  });

  return NextResponse.json({ zones: out, board });
}
