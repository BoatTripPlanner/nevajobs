"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { COLLECTIONS, type RolUsuario, type Usuario } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: Usuario | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(
          doc(db, COLLECTIONS.USUARIOS, firebaseUser.uid),
        );
        setProfile(
          snap.exists()
            ? ({ uid: snap.id, ...snap.data() } as Usuario)
            : null,
        );
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return;
    const snap = await getDoc(doc(db, COLLECTIONS.USUARIOS, current.uid));
    setProfile(
      snap.exists() ? ({ uid: snap.id, ...snap.data() } as Usuario) : null,
    );
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile }),
    [user, profile, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRol(): RolUsuario | null {
  return useAuth().profile?.rol ?? null;
}
