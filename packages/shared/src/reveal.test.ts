import { describe, expect, it } from "vitest";
import {
  canAccessRevealedPhotos,
  canSetPhotoReveal,
  counterpartyRevealed,
  isRevealingOwn,
} from "./reveal";

const match = (photoReveal: Record<string, boolean>, status: "active" | "closed" = "active") => ({
  uids: ["aisha", "omar"] as [string, string],
  status,
  photoReveal,
});

describe("photo reveal", () => {
  it("reads each side's own reveal flag", () => {
    const m = match({ omar: true, aisha: false });
    expect(isRevealingOwn(m, "omar")).toBe(true);
    expect(isRevealingOwn(m, "aisha")).toBe(false);
  });

  it("sees the counterparty's reveal from the viewer's side", () => {
    const m = match({ omar: true, aisha: false });
    // aisha (viewer) sees omar revealed
    expect(counterpartyRevealed(m, "aisha")).toBe(true);
    // omar (viewer) sees aisha NOT revealed
    expect(counterpartyRevealed(m, "omar")).toBe(false);
  });

  it("grants revealed-photo access only to a member whose counterparty revealed", () => {
    const m = match({ omar: true, aisha: false });
    expect(canAccessRevealedPhotos(m, "aisha")).toEqual({ ok: true });
    expect(canAccessRevealedPhotos(m, "omar")).toMatchObject({ reason: "notRevealed" });
    expect(canAccessRevealedPhotos(m, "zaid")).toMatchObject({ reason: "notParticipant" });
  });

  it("revocation immediately denies access on the next check", () => {
    const revealed = match({ omar: true });
    expect(canAccessRevealedPhotos(revealed, "aisha")).toEqual({ ok: true });
    const revoked = match({ omar: false });
    expect(canAccessRevealedPhotos(revoked, "aisha")).toMatchObject({ reason: "notRevealed" });
  });

  it("lets a participant of an active match toggle their reveal, not a closed one", () => {
    expect(canSetPhotoReveal(match({}), "omar")).toBe(true);
    expect(canSetPhotoReveal(match({}), "zaid")).toBe(false);
    expect(canSetPhotoReveal(match({}, "closed"), "omar")).toBe(false);
  });
});
