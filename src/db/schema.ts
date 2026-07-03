import { pgTable, uuid, text, doublePrecision, timestamp, index, jsonb } from "drizzle-orm/pg-core";

// Un joueur. L'auth (Better Auth) viendra brancher son `user.id` ici plus
// tard ; pour l'instant on identifie par pseudo (unique) + un id stable.
export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  pseudo: text("pseudo").notNull().unique(),
  email: text("email"),
  faction: text("faction"), // pays/ville de ralliement, décidé plus tard
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Une frappe : le cœur du jeu. On persiste tout ce qui est rejouable et
// intéressant à afficher au retour du joueur. city/country géocodés plus tard.
export const strikes = pgTable(
  "strikes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    lng: doublePrecision("lng").notNull(),
    lat: doublePrecision("lat").notNull(),
    weapon: text("weapon").notNull(), // mk1 | rkt | moab | nuke
    seed: doublePrecision("seed"), // pour rejouer le même decal/rotation
    faction: text("faction"), // camp du joueur au moment de la frappe
    zoneId: text("zone_id"), // zone (pays) touchée — code ADM0_A3, ex "FRA"
    city: text("city"), // géocodage différé
    country: text("country"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("strikes_player_idx").on(t.playerId),
    index("strikes_created_idx").on(t.createdAt),
    index("strikes_zone_idx").on(t.zoneId),
  ],
);

// Une zone conquérable = un pays (code ADM0_A3). control = points par faction ;
// owner = faction majoritaire (recalculée à chaque frappe).
export const zones = pgTable("zones", {
  id: text("id").primaryKey(), // code pays, ex "FRA"
  name: text("name").notNull(),
  control: jsonb("control").notNull().default({}), // { crimson: 12, azure: 3, ... }
  owner: text("owner"), // faction dominante (slug) ou null si vierge
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Player = typeof players.$inferSelect;
export type Strike = typeof strikes.$inferSelect;
export type Zone = typeof zones.$inferSelect;
