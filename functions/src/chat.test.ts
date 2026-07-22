import { describe, expect, it } from "vitest";
import { buildMatchUpdateOnMessage, evaluateMessageModeration } from "./chat";

describe("evaluateMessageModeration", () => {
  it("flags a message containing a banned word", () => {
    expect(evaluateMessageModeration("here is my whatsapp", ["whatsapp"])).toEqual({
      flagged: true,
    });
    expect(evaluateMessageModeration("assalamu alaikum", ["whatsapp"])).toEqual({ flagged: false });
  });
});

describe("buildMatchUpdateOnMessage", () => {
  it("computes the preview and the recipient (non-sender) to increment", () => {
    const update = buildMatchUpdateOnMessage("  Salaam,   how are you?  ", "omar", [
      "aisha",
      "omar",
    ]);
    expect(update.lastMessagePreview).toBe("Salaam, how are you?");
    expect(update.recipientUid).toBe("aisha");
  });
});
