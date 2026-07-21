import type { AuthUser } from "../domain/auth";

export interface Credentials {
  email: string;
  password: string;
}

/**
 * AuthService port (master spec Section 5.2). Exposes domain types only; the
 * Firebase adapter under `infrastructure/firebase/**` implements it. Product
 * code depends on this interface, never on the Firebase SDK.
 */
export interface AuthService {
  signUp(credentials: Credentials): Promise<AuthUser>;
  signIn(credentials: Credentials): Promise<AuthUser>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  /** Reload the current user from the backend and return the fresh snapshot. */
  reload(): Promise<AuthUser | null>;
  /** Subscribe to auth-state changes; returns an unsubscribe function. */
  onAuthChange(callback: (user: AuthUser | null) => void): () => void;
}

/** Stable, backend-neutral error codes surfaced by the AuthService. */
export type AuthErrorCode =
  | "invalid-credentials"
  | "email-in-use"
  | "weak-password"
  | "too-many-requests"
  | "network"
  | "unknown";

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}
