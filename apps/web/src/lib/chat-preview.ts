import { makePairKey, type ChatMessage } from "@nisfi/shared";
import { PREVIEW_VIEWER } from "@/lib/discovery-preview";

const me = PREVIEW_VIEWER.uid;

/** Contact-sharing terms blocked client-side in preview to demonstrate the
 * check; the authoritative list comes from `appConfig.bannedWords` once wired
 * (O-001), and the server re-checks and flags regardless. */
export const DEMO_BANNED_WORDS = ["whatsapp", "telegram", "instagram", "واتساب", "تلغرام"];

function msg(id: string, sender: string, text: string, at: string, deleted = false): ChatMessage {
  return { id, senderUid: sender, text, deleted, moderation: { flagged: false }, createdAt: at };
}

/** Seeded messages for the preview match with سُمَيّة (p1). */
export function getPreviewMessages(pairKey: string): ChatMessage[] {
  if (pairKey === makePairKey(me, "p1")) {
    return [
      msg("m1", "p1", "وعليكم السلام، تشرّفت بمعرفتك.", "2026-03-19T18:20:00.000Z"),
      msg("m2", me, "أهلًا، شكرًا لتواصلك. كيف حالك؟", "2026-03-19T18:24:00.000Z"),
      msg("m3", "p1", "بخير والحمد لله، وأنت؟", "2026-03-19T18:30:00.000Z"),
    ];
  }
  return [];
}
