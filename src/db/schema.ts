import { pgTable, uuid, text, doublePrecision, timestamp, index } from "drizzle-orm/pg-core";

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
    city: text("city"), // géocodage différé
    country: text("country"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("strikes_player_idx").on(t.playerId),
    index("strikes_created_idx").on(t.createdAt),
  ],
);

export type Player = typeof players.$inferSelect;
export type Strike = typeof strikes.$inferSelect;
