import { describe, expect, it } from "vitest";
import {
  canViewAudit,
  matchesAuditFilter,
  redactAuditMetadata,
  REDACTED,
  type AuditLogEntry,
} from "./audit";

const entry: AuditLogEntry = {
  id: "a1",
  actorUid: "s1",
  actorRole: "superAdmin",
  action: "sanction",
  targetType: "user",
  targetId: "u_omar",
  metadata: {},
  createdAt: "2026-03-15T10:00:00.000Z",
};

describe("canViewAudit", () => {
  it("is superAdmin-only", () => {
    expect(canViewAudit("superAdmin")).toBe(true);
    expect(canViewAudit("admin")).toBe(false);
    expect(canViewAudit("moderator")).toBe(false);
  });
});

describe("matchesAuditFilter", () => {
  it("filters by actor, action, target, and date range", () => {
    expect(matchesAuditFilter(entry, {})).toBe(true);
    expect(matchesAuditFilter(entry, { action: "sanction" })).toBe(true);
    expect(matchesAuditFilter(entry, { action: "export" })).toBe(false);
    expect(matchesAuditFilter(entry, { actorUid: "other" })).toBe(false);
    expect(matchesAuditFilter(entry, { targetId: "u_omar" })).toBe(true);
    expect(matchesAuditFilter(entry, { from: "2026-03-01", to: "2026-03-31" })).toBe(true);
    expect(matchesAuditFilter(entry, { from: "2026-04-01" })).toBe(false);
  });
});

describe("redactAuditMetadata", () => {
  it("redacts sensitive keys, recursing into nested objects", () => {
    const out = redactAuditMetadata({
      plan: "free",
      email: "a@b.com",
      nested: { sessionToken: "xyz", count: 3 },
      note: "ok",
    });
    expect(out).toEqual({
      plan: "free",
      email: REDACTED,
      nested: { sessionToken: REDACTED, count: 3 },
      note: "ok",
    });
  });
});
