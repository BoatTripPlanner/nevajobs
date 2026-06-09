/**
 * Nevajobs — Firestore & Storage schema
 * ======================================
 * Colecciones principales en Firestore (proyecto: nevajobs-10938).
 * Los nombres de campo siguen snake_case para alinearse con la consola y las reglas.
 *
 * Rutas Storage relacionadas:
 *   /cvs/{uid}/{fileName}        → PDF del currículum (acceso restringido)
 *   /audio-intros/{uid}/{fileName} → Voice intro del candidato (futuro)
 *
 * Reglas de seguridad:
 *   firebase/firestore.rules  → Firestore (producción)
 *   firebase/storage.rules    → Storage (/cvs)
 */

import type { Timestamp } from "firebase/firestore";

// ---------------------------------------------------------------------------
// Constantes de colecciones
// ---------------------------------------------------------------------------

export const COLLECTIONS = {
  USUARIOS: "usuarios",
  OFERTAS: "ofertas",
  POSTULACIONES: "postulaciones",
  DESBLOQUEOS: "desbloqueos",
  CHATS: "chats",
  MENSAJES: "mensajes", // subcolección: chats/{chatId}/mensajes
  ESTADISTICAS_EN_VIVO: "estadisticas_en_vivo",
} as const;

export const STORAGE_PATHS = {
  CVS: "cvs",
  AUDIO_INTROS: "audio-intros",
  VIDEO_INTROS: "video-intros",
  REFUND_DOCS: "refund-docs",
} as const;

export type DevolucionEstado = "pendiente" | "aprobada" | "rechazada";

// ---------------------------------------------------------------------------
// Tipos compartidos
// ---------------------------------------------------------------------------

export type RolUsuario = "candidato" | "empresa";

export type PlanEmpresa = "gratis" | "starter" | "pro" | "enterprise";

export type CategoriaOferta = "hoteles" | "escuelas" | "alquiler" | "oficina";

export type ModalidadDeportiva = "ski" | "snowboard" | "both";

export type ZonaEconomica = "UE" | "Suiza" | "Andorra";

export type EstadoPostulacion =
  | "pendiente"
  | "vista"
  | "contactada"
  | "rechazada"
  | "contratada";

export type CodigoIdioma = "EN" | "ES" | "FR" | "DE" | "IT" | "PT" | "NL";

// ---------------------------------------------------------------------------
// usuarios/{uid}
// Document ID = Firebase Auth uid
// ---------------------------------------------------------------------------

/**
 * Perfil unificado de candidato o empresa.
 * Las empresas usan los mismos campos premium/créditos; los campos de candidato
 * (titulación, audio, etc.) quedan opcionales según el rol.
 */
export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  rol: RolUsuario;

  /** Empresa: acceso Premium para desbloquear CVs, chat y valoraciones. */
  es_premium: boolean;
  /** Empresa: plan activo (gratis | starter | pro | enterprise). */
  plan_empresa?: PlanEmpresa;
  /** Empresa: créditos pay-per-use (1 crédito = 1 desbloqueo de candidato). */
  creditos_disponibles: number;
  /** Empresa Starter: desbloqueos consumidos en el mes actual. */
  desbloqueos_mes_usados?: number;
  /** Mes ISO (YYYY-MM) del contador de desbloqueos. */
  desbloqueos_mes_reset_mes?: string;
  /** Empresa Enterprise: ofertas destacadas usadas este mes. */
  ofertas_destacadas_mes_usadas?: number;

  /** Candidato: titulación de instructor (ej. BASI, ESF, AASI). */
  titulacion?: string;
  /** Candidato: modalidad principal de enseñanza o preferencia laboral. */
  modalidad_principal?: ModalidadDeportiva;
  /** Candidato: idiomas hablados con fluencia verificable (Voice Intro). */
  idiomas_hablados: CodigoIdioma[] | string[];
  pais_origen: string;

  /** Storage path o download URL firmada — nunca enlace público. */
  url_cv?: string;
  /** Voice Intro (~30 s) para el pasaporte de idiomas. */
  url_audio_intro?: string;
  /** Video-presentación corta (~15 s) — candidatos Pro+. */
  url_video_intro?: string;

  /** Temporadas de nieve completadas con éxito (tag anti-fugas). */
  temporadas_completadas?: number;
  /** UID del compañero/a para contratación combinada (parejas). */
  pareja_uid?: string;

  /** Emergency switch: disponible para incorporación inmediata / in resort. */
  disponibilidad_inmediata: boolean;
  /** Candidato: autorizado a trabajar en la UE/EEE/Suiza según declaración. */
  permiso_trabajo_ue: boolean;

  /** Media de valoraciones recibidas (0–5). Solo candidatos. */
  valoracion_media: number;

  /** Stripe — gestionado por webhook (Admin SDK). */
  stripe_customer_id?: string;
  stripe_subscription_id?: string;

  /** Candidato: estación actual si ya está in resort. */
  estacion_actual?: string;
  /** Candidato: puesto o rol que busca. */
  rol_buscado?: string;
  /** Candidato: confirmación de estar físicamente en estación. */
  en_estacion?: boolean;

  /** Empresa: descripción breve de la empresa. */
  descripcion_empresa?: string;
  /** Empresa: categorías en las que contrata habitualmente. */
  categorias_contratacion?: CategoriaOferta[];
  /** Empresa: estaciones donde opera o contrata. */
  estaciones_operacion?: string[];
  /** Empresa: sitio web (opcional). */
  sitio_web?: string;
  /** Enterprise: alertas Telegram (chat ID o @usuario). */
  alerta_telegram?: string;
  /** Enterprise: alertas WhatsApp (número E.164). */
  alerta_whatsapp?: string;
  /** Enterprise: logo para ofertas de marca. */
  url_logo_empresa?: string;

  /** true cuando el usuario completó el onboarding de perfil. */
  perfil_completo?: boolean;

  /** Candidato verificado por Nevajobs (titulación/visado contrastados). */
  verificado_nevajobs?: boolean;

  /** Metadatos recomendados */
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

/** Payload parcial para crear/actualizar perfil. */
export type UsuarioInput = Omit<Usuario, "uid"> & { uid?: string };

// ---------------------------------------------------------------------------
// ofertas/{ofertaId}
// ---------------------------------------------------------------------------

export interface Oferta {
  id: string;
  titulo: string;
  empresa_id: string;
  nombre_empresa: string;
  pais: string;
  estacion: string;
  categoria: CategoriaOferta;
  /** Obligatorio si categoria === 'escuelas'. */
  modalidad?: ModalidadDeportiva;

  incluye_alojamiento: boolean;
  acepta_parejas: boolean;
  /** Texto libre: tipo de habitación, parejas, staff house, etc. */
  detalles_alojamiento?: string;

  idiomas_requeridos: CodigoIdioma[] | string[];
  zona_economica: ZonaEconomica;

  activa: boolean;
  fecha_publicacion: Timestamp;

  /** Descripción completa (puede generarse con IA). */
  descripcion?: string;
  /** Enterprise: oferta destacada con diseño de marca. */
  destacada?: boolean;
  marca_personalizada?: boolean;
  url_logo?: string;
  url_foto_instalacion?: string;

  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export type OfertaInput = Omit<Oferta, "id" | "fecha_publicacion"> & {
  id?: string;
  fecha_publicacion?: Timestamp;
};

// ---------------------------------------------------------------------------
// postulaciones/{postulacionId}
// ---------------------------------------------------------------------------

/**
 * Relación candidato ↔ oferta.
 * La empresa Premium puede ver el CV completo vinculado al candidato_id.
 */
export interface Postulacion {
  id: string;
  oferta_id: string;
  candidato_id: string;
  empresa_id: string;

  estado: EstadoPostulacion;
  mensaje_presentacion?: string;
  fecha_postulacion: Timestamp;

  /** Si la empresa ya desbloqueó el perfil premium del candidato. */
  perfil_desbloqueado?: boolean;
  fecha_desbloqueo?: Timestamp;
}

export type PostulacionInput = Omit<Postulacion, "id" | "fecha_postulacion"> & {
  id?: string;
  fecha_postulacion?: Timestamp;
};

// ---------------------------------------------------------------------------
// desbloqueos/{desbloqueoId}
// Empresa desbloquea candidato (CV, audio, chat)
// ---------------------------------------------------------------------------

export interface Desbloqueo {
  id: string;
  empresa_id: string;
  candidato_id: string;
  oferta_id?: string;
  fecha_desbloqueo: Timestamp;
  /** Si consumió 1 crédito pay-per-use en lugar de cupo del plan. */
  uso_credito?: boolean;
  /** Chat directo activo hasta esta fecha (30 días tras desbloqueo). */
  chat_hasta?: Timestamp;
  /** Ventana de garantía de sustitución (7 días si uso_credito). */
  garantia_hasta?: Timestamp;
  devolucion_estado?: DevolucionEstado;
  /** Documento oficial de alta en empresa (para devolución). */
  doc_alta_url?: string;
  /** Documento oficial de baja / no incorporación (para devolución). */
  doc_baja_url?: string;
  devolucion_motivo?: string;
}

export type DesbloqueoInput = Omit<Desbloqueo, "id" | "fecha_desbloqueo"> & {
  id?: string;
  fecha_desbloqueo?: Timestamp;
};

// ---------------------------------------------------------------------------
// chats/{chatId}
// Subcolección: chats/{chatId}/mensajes/{mensajeId}
// ---------------------------------------------------------------------------

export interface Chat {
  id: string;
  /** [candidato_uid, empresa_uid] — siempre 2 participantes. */
  participantes: [string, string];
  oferta_id: string;
  postulacion_id: string;

  ultimo_mensaje?: string;
  ultimo_mensaje_fecha: Timestamp;

  /** uid del usuario que leyó por última vez (simplificado; ampliar con map por uid). */
  leido_por?: string[];

  created_at: Timestamp;
}

export interface Mensaje {
  id: string;
  chat_id: string;
  remitente_id: string;
  texto: string;
  fecha: Timestamp;
  leido: boolean;
}

export type ChatInput = Omit<Chat, "id" | "created_at" | "ultimo_mensaje_fecha"> & {
  id?: string;
  created_at?: Timestamp;
  ultimo_mensaje_fecha?: Timestamp;
};

export type MensajeInput = Omit<Mensaje, "id" | "fecha"> & {
  id?: string;
  fecha?: Timestamp;
};

// ---------------------------------------------------------------------------
// estadisticas_en_vivo/{docId}
// Documento único recomendado: docId = "global"
// ---------------------------------------------------------------------------

export interface EstadisticasEnVivo {
  id: string;
  ofertas_activas: number;
  candidatos_disponibles: number;
  paises_top_contratacion: string[];
  actualizado_en: Timestamp;
}

export type EstadisticasEnVivoInput = Omit<
  EstadisticasEnVivo,
  "id" | "actualizado_en"
> & {
  id?: string;
  actualizado_en?: Timestamp;
};

// ---------------------------------------------------------------------------
// Storage — metadatos opcionales en Firestore (referencia)
// ---------------------------------------------------------------------------

/** Convención de rutas en Firebase Storage (no públicas). */
export interface StorageCvMetadata {
  /** Ruta: cvs/{uid}/cv.pdf */
  path: `cvs/${string}/${string}`;
  content_type: "application/pdf";
  size_bytes: number;
  uploaded_at: Timestamp;
}

// ---------------------------------------------------------------------------
// Re-export UI types (legacy / componentes actuales)
// ---------------------------------------------------------------------------

export type {
  Job,
  JobCategory,
  SportModality,
  LiveStats,
  JobSearchFilters,
  Candidate,
} from "./job";

export {
  /** Mapeo UI → Firestore para migración gradual de componentes. */
  categoriaToFirestore,
  categoriaFromFirestore,
} from "./mappers";
