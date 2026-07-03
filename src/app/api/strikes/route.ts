import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { players, strikes, zones } from "@/db/schema";
import { isFaction, WEAPON_WEIGHT, dominant, type Control } from "@/lib/game";

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
      faction: strikes.faction,
      createdAt: strikes.createdAt,
      pseudo: players.pseudo,
    })
    .from(strikes)
    .innerJoin(players, eq(strikes.playerId, players.id))
    .orderBy(desc(strikes.createdAt))
    .limit(limit);
  return NextResponse.json({ strikes: rows });
}

// POST /api/strikes  { pseudo, faction, lng, lat, weapon, seed?, zoneId?, zoneName? }
// → enregistre la frappe ET met à jour le contrôle de la zone touchée.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { pseudo, faction, lng, lat, weapon, seed, zoneId, zoneName } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof pseudo !== "string" || !pseudo.trim() || pseudo.length > 32)
    return NextResponse.json({ error: "pseudo invalide" }, { status: 400 });
  if (typeof lng !== "number" || typeof lat !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return NextResponse.json({ error: "coordonnées invalides" }, { status: 400 });
  if (typeof weapon !== "string" || !["mk1", "rkt", "moab", "nuke"].includes(weapon))
    return NextResponse.json({ error: "arme invalide" }, { status: 400 });
  const fac = isFaction(faction) ? faction : null;
  const zid = typeof zoneId === "string" && zoneId.length <= 8 ? zoneId : null;
  const zname = typeof zoneName === "string" ? zoneName.slice(0, 80) : zid;

  // upsert du joueur (pseudo + faction courante)
  const [player] = await db
    .insert(players)
    .values({ pseudo: pseudo.trim(), faction: fac })
    .onConflictDoUpdate({ target: players.pseudo, set: { faction: fac } })
    .returning({ id: players.id });

  const [strike] = await db
    .insert(strikes)
    .values({
      playerId: player.id,
      lng, lat, weapon,
      seed: typeof seed === "number" ? seed : null,
      faction: fac,
      zoneId: zid,
    })
    .returning();

  // ── Contrôle de zone : frappe en mer/hors zone → pas de mise à jour ──
  let zone: { id: string; owner: string | null; control: Control } | null = null;
  if (fac && zid) {
    const weight = WEAPON_WEIGHT[weapon] ?? 1;
    zone = await db.transaction(async (tx) => {
      const existing = await tx.select().from(zones).where(eq(zones.id, zid)).for("update");
      const control: Control = { ...((existing[0]?.control as Control) ?? {}) };
      control[fac] = (control[fac] ?? 0) + weight;
      const owner = dominant(control);
      if (existing[0]) {
        await tx.update(zones).set({ control, owner, updatedAt: new Date() }).where(eq(zones.id, zid));
      } else {
        await tx.insert(zones).values({ id: zid, name: zname ?? zid, control, owner });
      }
      return { id: zid, owner, control };
    });
  }

  return NextResponse.json({ strike, zone }, { status: 201 });
}
