"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  containsBannedWord,
  isValidMessageText,
  otherUid,
  MESSAGE_TEXT_MAX,
  type ChatMessage,
} from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { useConversation } from "@/lib/use-conversation";
import { getPreviewProfile } from "@/lib/discovery-preview";
import { DEMO_BANNED_WORDS } from "@/lib/chat-preview";

function Bubble({
  message,
  mine,
  onDelete,
}: {
  message: ChatMessage;
  mine: boolean;
  onDelete: (m: ChatMessage) => void;
}) {
  const t = useTranslations("Chat");
  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
          mine ? "bg-primary text-white" : "border border-border bg-surface text-ink",
        )}
      >
        {message.deleted ? (
          <span className={cn("italic", mine ? "text-white/75" : "text-ink-600")}>
            {t("removed")}
          </span>
        ) : (
          <span className="whitespace-pre-wrap break-words">{message.text}</span>
        )}
      </div>
      <div className="flex items-center gap-2 px-1">
        {message.moderation.flagged ? <Badge tone="pending">{t("flagged")}</Badge> : null}
        {mine && !message.deleted ? (
          <button
            type="button"
            onClick={() => onDelete(message)}
            className="text-xs text-ink-600 hover:text-danger hover:underline"
          >
            {t("delete")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Conversation({ matchId }: { matchId: string }) {
  const t = useTranslations("Chat");
  const { messages, match, viewerUid, loading, preview, closed, send, remove, close } =
    useConversation(matchId);
  const [text, setText] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const otherName = useMemo(() => {
    const other =
      (match && viewerUid && otherUid(match, viewerUid)) ??
      matchId.split("_").find((u) => u !== (viewerUid ?? ""));
    if (match && other && match.participants[other]?.displayName) {
      return match.participants[other].displayName;
    }
    return (other && getPreviewProfile(other)?.profile.displayName) || t("aMember");
  }, [match, matchId, viewerUid, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const banned = text.length > 0 && containsBannedWord(text, DEMO_BANNED_WORDS);
  const canSend = isValidMessageText(text) && !banned;

  function submit() {
    if (!canSend) return;
    void send(text.trim());
    setText("");
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-2xl flex-col">
      <header className="flex items-center gap-3 border-b border-border pb-3">
        <Link
          href="/app/matches"
          aria-label={t("back")}
          className="text-primary-700 hover:underline"
        >
          {t("back")}
        </Link>
        <span className="font-bold text-ink">{otherName}</span>
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
        <div className="ms-auto">
          {closed ? (
            <Badge tone="neutral">{t("closedBadge")}</Badge>
          ) : confirmClose ? (
            <span className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => void close()}
                className="font-semibold text-danger hover:underline"
              >
                {t("confirmClose")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="text-ink-600 hover:underline"
              >
                {t("cancel")}
              </button>
            </span>
          ) : match ? (
            <button
              type="button"
              onClick={() => setConfirmClose(true)}
              className="text-sm text-ink-600 hover:text-danger hover:underline"
            >
              {t("closeMatch")}
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
        {loading ? (
          <>
            <Skeleton className="h-9 w-40 self-start rounded-2xl" />
            <Skeleton className="h-9 w-52 self-end rounded-2xl" />
          </>
        ) : messages.length === 0 ? (
          <p className="m-auto max-w-[36ch] text-center text-sm text-ink-600">{t("emptyBody")}</p>
        ) : (
          messages.map((m) => (
            <Bubble
              key={m.id}
              message={m}
              mine={m.senderUid === viewerUid}
              onDelete={(msg) => void remove(msg)}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border pt-3">
        {closed ? (
          <p className="rounded-md border border-border bg-canvas p-3 text-center text-sm text-ink-600">
            {t("closedNote")}
          </p>
        ) : (
          <>
            {banned ? (
              <p className="mb-2 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">
                {t("bannedWarning")}
              </p>
            ) : null}
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                maxLength={MESSAGE_TEXT_MAX}
                placeholder={t("placeholder")}
                aria-label={t("placeholder")}
                className={cn(
                  "max-h-32 min-h-11 flex-1 resize-none rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink",
                  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                )}
              />
              <Button onClick={submit} disabled={!canSend}>
                {t("send")}
              </Button>
            </div>
            <p className="mt-1.5 text-center text-xs text-ink-600">{t("privacyNote")}</p>
          </>
        )}
      </div>
    </div>
  );
}
