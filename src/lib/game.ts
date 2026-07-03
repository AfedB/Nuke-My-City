// Règles de jeu partagées (factions, poids des armes pour le contrôle de zone).

export const FACTIONS = ["crimson", "azure", "viridian"] as const;
export type Faction = (typeof FACTIONS)[number];

export function isFaction(x: unknown): x is Faction {
  return typeof x === "string" && (FACTIONS as readonly string[]).includes(x);
}

// Poids de contrôle par arme : la nuke pèse lourd, le missile peu.
// (RKT = tiré en rafale → chaque roquette est une frappe légère.)
export const WEAPON_WEIGHT: Record<string, number> = {
  mk1: 3,
  rkt: 1,
  moab: 10,
  nuke: 30,
};

export type Control = Record<string, number>;

// Faction dominante d'une zone = celle au plus de points.
export function dominant(control: Control): string | null {
  let best: string | null = null;
  let max = -Infinity;
  for (const [f, v] of Object.entries(control)) {
    if (v > max) { max = v; best = f; }
  }
  return max > 0 ? best : null;
}

// Propriétaire RÉEL : la faction en tête, mais seulement si elle a rempli la
// jauge de conquête (capacité ∝ superficie du pays). Sinon zone contestée.
export function capturedOwner(control: Control, cap: number): string | null {
  const lead = dominant(control);
  if (!lead) return null;
  return control[lead] >= cap ? lead : null;
}
