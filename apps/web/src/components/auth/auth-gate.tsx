"use client";

import { useEffect, type ReactNode } from "react";
import { isStaff } from "@/core/domain/auth";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/navigation";

function FullScreenLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas">
      <span
        className="size-8 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

/**
 * Client-side access gate for the member/admin areas. UX only — real
 * authorization is enforced server-side by Firestore/Storage rules and
 * Functions (master spec A-008: "UI visibility is never authorization").
 *
 * When Firebase is not configured (preview mode without emulator or keys,
 * per directive O-001) the gate lets content through so the shells stay
 * viewable; enforcement activates as soon as auth is configured.
 */
function AuthGate({ children, staffOnly = false }: { children: ReactNode; staffOnly?: boolean }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  const blocked = configured && (!user || !user.emailVerified || (staffOnly && !isStaff(user)));

  useEffect(() => {
    if (!configured || loading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.emailVerified) {
      router.replace("/auth/verify-email");
    } else if (staffOnly && !isStaff(user)) {
      router.replace("/app");
    }
  }, [configured, loading, user, staffOnly, router]);

  if (!configured) return <>{children}</>;
  if (loading || blocked) return <FullScreenLoading />;
  return <>{children}</>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <AuthGate staffOnly>{children}</AuthGate>;
}
