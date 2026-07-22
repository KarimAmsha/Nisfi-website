/**
 * Role model (master spec Sections 6, 11). Roles come from Firebase custom
 * claims — the authoritative source, mirrored (not trusted) in Firestore. The
 * security rules use the same ordering; these helpers keep the web app, the
 * Functions, and the console gating aligned.
 */
export const ROLES = ["user", "moderator", "admin", "superAdmin"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = { user: 0, moderator: 1, admin: 2, superAdmin: 3 };

export function isStaffRole(role: Role): boolean {
  return RANK[role] >= RANK.moderator;
}

export function isAdminRole(role: Role): boolean {
  return RANK[role] >= RANK.admin;
}

export function isSuperAdminRole(role: Role): boolean {
  return role === "superAdmin";
}

/** Whether `role` meets or exceeds the required minimum role. */
export function roleAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}
