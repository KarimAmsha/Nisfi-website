"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "@/core/domain/auth";
import type { Credentials } from "@/core/ports/auth";
import { authService } from "@/infrastructure/firebase/auth.service";
import { isFirebaseConfigured } from "@/infrastructure/firebase/env";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (credentials: Credentials) => Promise<AuthUser>;
  signUp: (credentials: Credentials) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  reload: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;
    return authService.onAuthChange((next) => {
      setUser(next);
      setLoading(false);
    });
  }, [configured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      signIn: (credentials) => authService.signIn(credentials),
      signUp: (credentials) => authService.signUp(credentials),
      signOut: () => authService.signOut(),
      sendPasswordReset: (email) => authService.sendPasswordReset(email),
      resendVerification: () => authService.sendEmailVerification(),
      reload: async () => {
        const next = await authService.reload();
        setUser(next);
        return next;
      },
    }),
    [user, loading, configured],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
