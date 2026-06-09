const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

async function recalculateLiveStats() {
  const [ofertasSnap, candidatosSnap] = await Promise.all([
    db.collection("ofertas").where("activa", "==", true).get(),
    db
      .collection("usuarios")
      .where("rol", "==", "candidato")
      .where("disponibilidad_inmediata", "==", true)
      .get(),
  ]);

  const countryCounts = new Map();
  for (const doc of ofertasSnap.docs) {
    const pais = doc.data().pais;
    if (pais) countryCounts.set(pais, (countryCounts.get(pais) ?? 0) + 1);
  }

  const stats = {
    id: "global",
    ofertas_activas: ofertasSnap.size,
    candidatos_disponibles: candidatosSnap.size,
    paises_top_contratacion: [...countryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pais]) => pais),
    actualizado_en: Timestamp.now(),
  };

  await db.collection("estadisticas_en_vivo").doc("global").set(stats, { merge: true });
  return stats;
}

exports.syncStatsOnOfertaWrite = onDocumentWritten("ofertas/{ofertaId}", async () => {
  await recalculateLiveStats();
});

exports.syncStatsOnUsuarioWrite = onDocumentWritten("usuarios/{userId}", async () => {
  await recalculateLiveStats();
});

exports.syncStatsScheduled = onSchedule("every 15 minutes", async () => {
  await recalculateLiveStats();
});
