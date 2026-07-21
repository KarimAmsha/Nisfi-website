import { AuthError } from "@/core/ports/auth";

/** Maps an AuthService error to a key under the `Auth.errors` message namespace. */
export function authErrorKey(error: unknown): "invalidCredentials" | "emailInUse" | "authFailed" {
  const code = error instanceof AuthError ? error.code : "unknown";
  switch (code) {
    case "invalid-credentials":
      return "invalidCredentials";
    case "email-in-use":
      return "emailInUse";
    default:
      return "authFailed";
  }
}
