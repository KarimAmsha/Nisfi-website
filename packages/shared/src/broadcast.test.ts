import { describe, expect, it } from "vitest";
import {
  broadcastInputSchema,
  canDispatch,
  canSendBroadcast,
  estimateAudience,
  matchesAudience,
  type AudienceMember,
} from "./broadcast";

const members: AudienceMember[] = [
  { uid: "a", status: "active", verified: true, gender: "female" },
  { uid: "b", status: "active", verified: false, gender: "male" },
  { uid: "c", status: "active", verified: true, gender: "male" },
  { uid: "d", status: "suspended", verified: true, gender: "female" },
  { uid: "e", status: "banned", verified: false, gender: "male" },
];

describe("canSendBroadcast", () => {
  it("is admin+", () => {
    expect(canSendBroadcast("admin")).toBe(true);
    expect(canSendBroadcast("superAdmin")).toBe(true);
    expect(canSendBroadcast("moderator")).toBe(false);
    expect(canSendBroadcast("user")).toBe(false);
  });
});

describe("matchesAudience / estimateAudience", () => {
  it("excludes suspended and banned members from every audience", () => {
    expect(matchesAudience(members[3]!, "all")).toBe(false);
    expect(matchesAudience(members[4]!, "all")).toBe(false);
  });

  it("counts each audience over active members", () => {
    expect(estimateAudience(members, "all")).toBe(3);
    expect(estimateAudience(members, "verified")).toBe(2);
    expect(estimateAudience(members, "unverified")).toBe(1);
    expect(estimateAudience(members, "male")).toBe(2);
    expect(estimateAudience(members, "female")).toBe(1);
  });
});

describe("broadcastInputSchema", () => {
  const valid = {
    audience: "all",
    title: { ar: "عنوان", en: "Title", tr: "Başlık" },
    body: { ar: "نص", en: "Body", tr: "Metin" },
  };

  it("accepts a fully-localized message", () => {
    expect(broadcastInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a blank locale, a bad audience, and overflow", () => {
    expect(
      broadcastInputSchema.safeParse({ ...valid, title: { ar: "", en: "T", tr: "B" } }).success,
    ).toBe(false);
    expect(broadcastInputSchema.safeParse({ ...valid, audience: "vips" }).success).toBe(false);
    expect(
      broadcastInputSchema.safeParse({ ...valid, body: { ar: "x".repeat(601), en: "b", tr: "b" } })
        .success,
    ).toBe(false);
  });
});

describe("canDispatch (idempotency)", () => {
  it("allows draft/failed and refuses sending/sent", () => {
    expect(canDispatch("draft")).toBe(true);
    expect(canDispatch("failed")).toBe(true);
    expect(canDispatch("sending")).toBe(false);
    expect(canDispatch("sent")).toBe(false);
  });
});
