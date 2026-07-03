import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { players, strikes } from "@/db/schema";

export const runtime = "nodejs";

// GET /api/strikes?limit=500 → frappes récentes (avec pseudo) à rejouer.
export async function GET(req: NextRequest) {
  const limit = Math.min(2000, Number(req.nextUrl.searchParams.get("limit")) || 500);
  const rows = await db
    .select({
      id: strikes.id,
      lng: strikes.lng,
      lat: strikes.lat,
      weapon: strikes.weapon,
      seed: strikes.seed,
      createdAt: strikes.createdAt,
      pseudo: players.pseudo,
    })
    .from(strikes)
    .innerJoin(players, eq(strikes.playerId, players.id))
    .orderBy(desc(strikes.createdAt))
    .limit(limit);
  return NextResponse.json({ strikes: rows });
}

// POST /api/strikes  { pseudo, lng, lat, weapon, seed? } → enregistre une frappe.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { pseudo, lng, lat, weapon, seed } = (body ?? {}) as Record<string, unknown>;

  if (typeof pseudo !== "string" || !pseudo.trim() || pseudo.length > 32)
    return NextResponse.json({ error: "pseudo invalide" }, { status: 400 });
  if (typeof lng !== "number" || typeof lat !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return NextResponse.json({ error: "coordonnées invalides" }, { status: 400 });
  if (typeof weapon !== "string" || !["mk1", "rkt", "moab", "nuke"].includes(weapon))
    return NextResponse.json({ error: "arme invalide" }, { status: 400 });

  // upsert du joueur par pseudo (auth Better Auth branchée plus tard)
  const [player] = await db
    .insert(players)
    .values({ pseudo: pseudo.trim() })
    .onConflictDoUpdate({ target: players.pseudo, set: { pseudo: pseudo.trim() } })
    .returning({ id: players.id });

  const [strike] = await db
    .insert(strikes)
    .values({
      playerId: player.id,
      lng,
      lat,
      weapon,
      seed: typeof seed === "number" ? seed : null,
    })
    .returning();

  return NextResponse.json({ strike }, { status: 201 });
}
