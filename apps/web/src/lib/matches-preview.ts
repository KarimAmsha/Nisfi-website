import { makePairKey, type Match } from "@nisfi/shared";
import { PREVIEW_VIEWER } from "@/lib/discovery-preview";

const me = PREVIEW_VIEWER.uid;

function match(
  other: string,
  name: string,
  preview: string | null,
  unread: number,
  at: string | null,
  otherRevealed = false,
): Match {
  const uids = [me, other].sort() as [string, string];
  return {
    pairKey: makePairKey(me, other),
    uids,
    participants: {
      [me]: { displayName: "أنت", primaryBlurredPath: null },
      [other]: { displayName: name, primaryBlurredPath: null },
    },
    status: "active",
    closedBy: null,
    closedReason: null,
    photoReveal: { [me]: false, [other]: otherRevealed },
    lastMessageAt: at,
    lastMessagePreview: preview,
    unread: { [me]: unread, [other]: 0 },
    requestId: "req-preview",
    createdAt: "2026-03-17T12:00:00.000Z",
  };
}

/** Preview seed (no backend) so the match list is demonstrable. */
export const PREVIEW_MATCHES: Match[] = [
  // سُمَيّة has revealed her photos to demonstrate the revealed state.
  match("p1", "سُمَيّة", "وعليكم السلام، تشرّفت بمعرفتك.", 2, "2026-03-19T18:30:00.000Z", true),
  match("p6", "فاطمة", null, 0, "2026-03-18T09:15:00.000Z"),
];

/** The preview match for a pairKey, or null. */
export function getPreviewMatch(pairKey: string): Match | null {
  return PREVIEW_MATCHES.find((m) => m.pairKey === pairKey) ?? null;
}
