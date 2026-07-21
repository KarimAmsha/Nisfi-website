import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload as reloadUser,
  sendEmailVerification as sendVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import type { AuthUser, UserRole } from "@/core/domain/auth";
import {
  AuthError,
  type AuthErrorCode,
  type AuthService,
  type Credentials,
} from "@/core/ports/auth";
import { firebaseAuth } from "./client";

function mapErrorCode(code: string): AuthErrorCode {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "invalid-credentials";
    case "auth/email-already-in-use":
      return "email-in-use";
    case "auth/weak-password":
      return "weak-password";
    case "auth/too-many-requests":
      return "too-many-requests";
    case "auth/network-request-failed":
      return "network";
    default:
      return "unknown";
  }
}

function toAuthError(error: unknown): AuthError {
  if (error instanceof FirebaseError) {
    return new AuthError(mapErrorCode(error.code));
  }
  return new AuthError("unknown");
}

async function mapUser(user: User | null): Promise<AuthUser | null> {
  if (!user) {
    return null;
  }
  const token = await user.getIdTokenResult();
  const role = (token.claims.role as UserRole | undefined) ?? "user";
  return { uid: user.uid, email: user.email, emailVerified: user.emailVerified, role };
}

class FirebaseAuthService implements AuthService {
  async signUp({ email, password }: Credentials): Promise<AuthUser> {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
      return (await mapUser(cred.user)) as AuthUser;
    } catch (error) {
      throw toAuthError(error);
    }
  }

  async signIn({ email, password }: Credentials): Promise<AuthUser> {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth(), email, password);
      return (await mapUser(cred.user)) as AuthUser;
    } catch (error) {
      throw toAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    await fbSignOut(firebaseAuth());
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(firebaseAuth(), email);
    } catch (error) {
      throw toAuthError(error);
    }
  }

  async sendEmailVerification(): Promise<void> {
    const user = firebaseAuth().currentUser;
    if (user) {
      await sendVerification(user);
    }
  }

  async reload(): Promise<AuthUser | null> {
    const user = firebaseAuth().currentUser;
    if (!user) {
      return null;
    }
    await reloadUser(user);
    return mapUser(user);
  }

  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(firebaseAuth(), (user) => {
      void mapUser(user).then(callback);
    });
  }
}

export const authService: AuthService = new FirebaseAuthService();
