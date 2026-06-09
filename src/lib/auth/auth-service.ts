import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { COLLECTIONS, type RolUsuario, type Usuario } from "@/types";

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  pais_origen: string;
  disponibilidad_inmediata?: boolean;
  permiso_trabajo_ue?: boolean;
}

function buildUsuarioDoc(
  uid: string,
  input: Pick<
    RegisterInput,
    | "nombre"
    | "email"
    | "rol"
    | "pais_origen"
    | "disponibilidad_inmediata"
    | "permiso_trabajo_ue"
  >,
): Omit<Usuario, "created_at" | "updated_at"> {
  return {
    uid,
    nombre: input.nombre.trim(),
    email: input.email.trim().toLowerCase(),
    rol: input.rol,
    es_premium: false,
    creditos_disponibles: 0,
    idiomas_hablados: [],
    pais_origen: input.pais_origen.trim(),
    disponibilidad_inmediata: input.disponibilidad_inmediata ?? false,
    permiso_trabajo_ue: input.permiso_trabajo_ue ?? false,
    valoracion_media: 0,
  };
}

export async function createUserProfile(
  uid: string,
  data: Omit<Usuario, "uid" | "created_at" | "updated_at">,
): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.USUARIOS, uid), {
    uid,
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function userProfileExists(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COLLECTIONS.USUARIOS, uid));
  return snap.exists();
}

async function triggerStatsRecalculation(): Promise<void> {
  try {
    await fetch("/api/cron/recalculate-stats", { method: "POST" });
  } catch {
    // Non-blocking; Cloud Functions also sync stats on write
  }
}

export async function registerWithEmail(
  input: RegisterInput,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password,
  );

  await updateProfile(credential.user, { displayName: input.nombre.trim() });

  await createUserProfile(
    credential.user.uid,
    buildUsuarioDoc(credential.user.uid, input),
  );

  void triggerStatsRecalculation();

  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  return credential.user;
}

export async function loginWithGoogle(
  rol: RolUsuario = "candidato",
): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  const exists = await userProfileExists(user.uid);
  if (!exists) {
    await createUserProfile(
      user.uid,
      buildUsuarioDoc(user.uid, {
        nombre: user.displayName ?? "User",
        email: user.email ?? "",
        rol,
        pais_origen: "",
      }),
    );
    void triggerStatsRecalculation();
  }

  return user;
}

export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Invalid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
  };
  return messages[code] ?? "Something went wrong. Please try again.";
}
