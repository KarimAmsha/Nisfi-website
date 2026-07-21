"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  canSendRequest,
  connectionMessageSchema,
  makePairKey,
  MESSAGE_MAX,
  REQUEST_LIMITS_FALLBACK,
  type SendRequestDecision,
} from "@nisfi/shared";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { useOwnProfile } from "@/lib/use-own-profile";
import { connectionRequestRepository } from "@/infrastructure/firebase/connection-request.repository";

type Phase = "compose" | "sending" | "sent" | "error";

/** Written connection-request composer (master spec Section F5). Contact begins
 * with a message, never a swipe. The server (CF6) is the authority on limits and
 * dedupe; this runs the same shared decision as a preflight and calls the send
 * port. In preview (no backend) it validates and simulates an honest outcome. */
export function RequestComposer({
  recipientUid,
  recipientName,
  onClose,
}: {
  recipientUid: string;
  recipientName: string;
  onClose: () => void;
}) {
  const t = useTranslations("Requests");
  const { configured, user } = useAuth();
  const { profile } = useOwnProfile();
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<Phase>("compose");
  const [denied, setDenied] = useState<SendRequestDecision & { ok: false }>();

  const trimmed = message.trim();
  const valid = connectionMessageSchema.safeParse(message).success;

  const reasonText = (reason: string) =>
    t(`deny.${reason}` as Parameters<typeof t>[0], {
      count: REQUEST_LIMITS_FALLBACK.maxPendingSent,
    });

  async function submit() {
    if (!valid) return;
    setDenied(undefined);

    // Client preflight with the shared decision (server re-checks authoritatively).
    if (configured && user && profile) {
      const pairKey = makePairKey(user.uid, recipientUid);
      const [pendingSentCount, latestForPair] = await Promise.all([
        connectionRequestRepository.countPendingSent(user.uid),
        connectionRequestRepository.getLatestForPair(pairKey),
      ]);
      const decision = canSendRequest({
        senderUid: user.uid,
        recipientUid,
        senderEligible: profile.verificationStatus === "verified",
        recipientEligible: true,
        pendingSentCount,
        sentToday: 0,
        latestForPair,
        limits: REQUEST_LIMITS_FALLBACK,
      });
      if (!decision.ok) {
        setDenied(decision);
        return;
      }
    }

    setPhase("sending");
    try {
      if (configured && user) {
        await connectionRequestRepository.send({
          fromUid: user.uid,
          toUid: recipientUid,
          message: trimmed,
        });
      }
      // Preview: no backend — surface an honest simulated outcome.
      setPhase("sent");
    } catch {
      setPhase("error");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("composerTitle", { name: recipientName })}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-ink/45"
      />
      <div className="relative w-full max-w-md rounded-t-xl border-t border-border bg-surface p-5 shadow-card sm:rounded-xl sm:border">
        {phase === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-success/10 text-success">
              <ShieldCheckIcon size={26} />
            </span>
            <h3 className="text-base font-bold text-ink">{t("sentTitle")}</h3>
            <p className="text-sm text-ink-600">
              {configured ? t("sentBody", { name: recipientName }) : t("sentPreview")}
            </p>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t("done")}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-ink">
                {t("composerTitle", { name: recipientName })}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-ink-600 hover:text-ink"
              >
                {t("close")}
              </button>
            </div>
            <p className="mb-3 text-sm text-ink-600">{t("composerHint")}</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MESSAGE_MAX}
              rows={4}
              placeholder={t("messagePlaceholder")}
              className={cn(
                "w-full resize-none rounded-md border border-border bg-surface p-3 text-sm text-ink",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              )}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-ink-600">
              <span>{t("noContactShared")}</span>
              <span className="tabular-nums">
                {trimmed.length}/{MESSAGE_MAX}
              </span>
            </div>

            {denied ? (
              <p className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2.5 text-sm text-warning">
                {reasonText(denied.reason)}
              </p>
            ) : null}
            {phase === "error" ? (
              <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 p-2.5 text-sm text-danger">
                {t("errorBody")}
              </p>
            ) : null}

            <div className="mt-4 flex gap-2">
              <Button
                block
                onClick={() => void submit()}
                loading={phase === "sending"}
                disabled={!valid}
              >
                {t("sendCta")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
