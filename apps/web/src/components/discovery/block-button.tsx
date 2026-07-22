"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { canBlock } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { blockRepository } from "@/infrastructure/firebase/block.repository";

/** Instant, unilateral, silent block (master spec F6). The server (CF10) closes
 * any active match and removes both directions from discovery; here we confirm
 * intent, call the block port, and surface a quiet confirmation. */
export function BlockButton({ targetUid }: { targetUid: string }) {
  const t = useTranslations("Blocked");
  const { configured, user } = useAuth();
  const [phase, setPhase] = useState<"idle" | "confirm" | "done" | "error">("idle");

  async function confirm() {
    if (configured && user && !canBlock(user.uid, targetUid).ok) return;
    try {
      if (configured && user) await blockRepository.block(targetUid);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  if (phase === "done") {
    return <p className="text-center text-xs text-ink-600">{t("doneNote")}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {phase === "confirm" ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void confirm()}
            className="text-sm font-semibold text-danger hover:underline"
          >
            {t("confirmBlock")}
          </button>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            className="text-sm text-ink-600 hover:underline"
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPhase("confirm")}
          className="text-sm text-ink-600 underline-offset-2 hover:text-danger hover:underline"
        >
          {t("blockCta")}
        </button>
      )}
      {phase === "error" ? <p className="text-xs text-danger">{t("errorBody")}</p> : null}
    </div>
  );
}
