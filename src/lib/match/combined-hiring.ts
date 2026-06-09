import { computeMatch } from "@/lib/match/compute-match";
import type { Oferta, Usuario } from "@/types";

export interface CombinedHiringSuggestion {
  ofertaA: Oferta;
  ofertaB: Oferta;
  candidatoA: Usuario;
  candidatoB: Usuario;
  score: number;
}

function areLinkedPair(a: Usuario, b: Usuario): boolean {
  if (a.pareja_uid && a.pareja_uid === b.uid) return true;
  if (b.pareja_uid && b.pareja_uid === a.uid) return true;
  const roleA = (a.rol_buscado ?? "").toLowerCase();
  const roleB = (b.rol_buscado ?? "").toLowerCase();
  const coupleHint =
    roleA.includes("pareja") ||
    roleA.includes("couple") ||
    roleB.includes("pareja") ||
    roleB.includes("couple");
  return coupleHint && a.pais_origen === b.pais_origen;
}

export function findCombinedHiringSuggestions(
  ofertas: Oferta[],
  candidatos: Usuario[],
  limit = 6,
): CombinedHiringSuggestion[] {
  const active = ofertas.filter((o) => o.activa);
  if (active.length < 2) return [];

  const suggestions: CombinedHiringSuggestion[] = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const ofertaA = active[i];
      const ofertaB = active[j];

      for (const candidatoA of candidatos) {
        for (const candidatoB of candidatos) {
          if (candidatoA.uid === candidatoB.uid) continue;
          if (!areLinkedPair(candidatoA, candidatoB)) continue;

          const matchA = computeMatch(ofertaA, candidatoA);
          const matchB = computeMatch(ofertaB, candidatoB);
          if (!matchA.isMatch || !matchB.isMatch) continue;

          suggestions.push({
            ofertaA,
            ofertaB,
            candidatoA,
            candidatoB,
            score: Math.round((matchA.score + matchB.score) / 2),
          });
        }
      }
    }
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
}
