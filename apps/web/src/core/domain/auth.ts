/**
 * Authentication domain types (master spec Sections 5, 6). Pure TypeScript —
 * no Firebase or Next imports. Roles come from Firebase custom claims at the
 * infrastructure boundary; `user` is the default when no claim is present.
 */
export type UserRole = "user" | "moderator" | "admin" | "superAdmin";

export const STAFF_ROLES: readonly UserRole[] = ["moderator", "admin", "superAdmin"];

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: UserRole;
}

export function isStaff(user: AuthUser | null): boolean {
  return user !== null && STAFF_ROLES.includes(user.role);
}
