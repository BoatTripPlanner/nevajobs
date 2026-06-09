import "server-only";

export interface GenerateOfferInput {
  rol: string;
  estacion: string;
  idioma: string;
  categoria?: string;
  empresa?: string;
}

const STATION_LOCALE: Record<string, { lang: string; country: string }> = {
  chamonix: { lang: "fr", country: "France" },
  verbier: { lang: "fr", country: "Switzerland" },
  "val d'isère": { lang: "fr", country: "France" },
  "val-disere": { lang: "fr", country: "France" },
  zermatt: { lang: "de", country: "Switzerland" },
  "st. anton": { lang: "de", country: "Austria" },
  "st-anton": { lang: "de", country: "Austria" },
  cortina: { lang: "it", country: "Italy" },
  "sierra nevada": { lang: "es", country: "Spain" },
};

function resolveLocale(estacion: string) {
  const key = estacion.trim().toLowerCase();
  return (
    STATION_LOCALE[key] ??
    Object.entries(STATION_LOCALE).find(([k]) => key.includes(k))?.[1] ?? {
      lang: "en",
      country: "Europe",
    }
  );
}

function templateOffer(input: GenerateOfferInput): { titulo: string; descripcion: string } {
  const locale = resolveLocale(input.estacion);
  const rol = input.rol.trim();
  const idioma = input.idioma.trim();
  const empresa = input.empresa?.trim() || "Nevajobs Partner";

  const templates: Record<string, { titulo: string; descripcion: string }> = {
    fr: {
      titulo: `${rol} — ${input.estacion} (saison hiver)` ,
      descripcion: `${empresa} recrute un(e) ${rol} pour la saison à ${input.estacion}, ${locale.country}. Langue requise : ${idioma}. Contrat saisonnier, logement possible selon profil. Rejoignez une équipe professionnelle du secteur privé de la montagne — candidats sérieux uniquement.`,
    },
    de: {
      titulo: `${rol} — ${input.estacion} (Wintersaison)`,
      descripcion: `${empresa} sucht eine/n ${rol} für die Saison in ${input.estacion}, ${locale.country}. Sprache: ${idioma}. Saisonvertrag, Unterkunft nach Absprache. Professionelles Team im privaten Schisektor — nur engagierte Kandidaten.`,
    },
    it: {
      titulo: `${rol} — ${input.estacion} (stagione invernale)`,
      descripcion: `${empresa} assume un/a ${rol} per la stagione a ${input.estacion}, ${locale.country}. Lingua richiesta: ${idioma}. Contratto stagionale, alloggio da concordare. Settore privato della neve — candidati affidabili.`,
    },
    es: {
      titulo: `${rol} — ${input.estacion} (temporada invierno)`,
      descripcion: `${empresa} contrata ${rol} para la temporada en ${input.estacion}, ${locale.country}. Idioma requerido: ${idioma}. Contrato de temporada, alojamiento según perfil. Sector privado de la nieve — profesionales comprometidos.`,
    },
    en: {
      titulo: `${rol} — ${input.estacion} (winter season)`,
      descripcion: `${empresa} is hiring a ${rol} for the season in ${input.estacion}, ${locale.country}. Required language: ${idioma}. Seasonal contract, accommodation may be available. Private snow sector — serious candidates only.`,
    },
  };

  return templates[locale.lang] ?? templates.en;
}

async function openAiOffer(input: GenerateOfferInput): Promise<{ titulo: string; descripcion: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const locale = resolveLocale(input.estacion);
  const prompt = `Write a professional seasonal job posting for the private snow sector in ${locale.country}.
Role: ${input.rol}
Resort: ${input.estacion}
Required language level: ${input.idioma}
Write in ${locale.lang === "en" ? "English" : locale.lang === "fr" ? "French" : locale.lang === "de" ? "German" : locale.lang === "it" ? "Italian" : "Spanish"}.
Return JSON only: {"titulo":"...","descripcion":"..."} — descripcion 2-3 sentences, professional tone.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as { titulo?: string; descripcion?: string };
    if (!parsed.titulo || !parsed.descripcion) return null;
    return { titulo: parsed.titulo, descripcion: parsed.descripcion };
  } catch {
    return null;
  }
}

export async function generateJobOffer(
  input: GenerateOfferInput,
): Promise<{ titulo: string; descripcion: string; source: "ai" | "template" }> {
  const ai = await openAiOffer(input);
  if (ai) return { ...ai, source: "ai" };
  return { ...templateOffer(input), source: "template" };
}
