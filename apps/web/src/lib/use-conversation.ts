"use client";

import { useCallback, useEffect, useState } from "react";
import {
  canCloseMatch,
  canDeleteMessage,
  canSetPhotoReveal,
  isValidMessageText,
  type ChatMessage,
  type Match,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { chatRepository } from "@/infrastructure/firebase/chat.repository";
import { matchRepository } from "@/infrastructure/firebase/match.repository";
import { getPreviewMessages } from "@/lib/chat-preview";
import { getPreviewMatch } from "@/lib/matches-preview";
import { PREVIEW_VIEWER } from "@/lib/discovery-preview";

export interface UseConversationResult {
  messages: ChatMessage[];
  match: Match | null;
  viewerUid: string | undefined;
  loading: boolean;
  preview: boolean;
  closed: boolean;
  send: (text: string) => Promise<void>;
  remove: (message: ChatMessage) => Promise<void>;
  close: () => Promise<void>;
  setReveal: (reveal: boolean) => Promise<void>;
}

export function useConversation(matchId: string): UseConversationResult {
  const { configured, user } = useAuth();
  const viewerUid = configured ? user?.uid : PREVIEW_VIEWER.uid;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setMessages(getPreviewMessages(matchId));
      setMatch(getPreviewMatch(matchId));
      setLoading(false);
      return;
    }
    if (!user) {
      setMessages([]);
      setMatch(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void matchRepository.getMatch(matchId).then(setMatch);
    const unsub = chatRepository.listen(matchId, (next) => {
      setMessages(next);
      setLoading(false);
    });
    return unsub;
  }, [configured, user, matchId]);

  const closed = match?.status === "closed";

  const send = useCallback(
    async (text: string) => {
      if (!viewerUid || closed || !isValidMessageText(text)) return;
      if (!configured) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            senderUid: viewerUid,
            text,
            deleted: false,
            moderation: { flagged: false },
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }
      await chatRepository.send({ matchId, senderUid: viewerUid, text });
    },
    [viewerUid, configured, closed, matchId],
  );

  const remove = useCallback(
    async (message: ChatMessage) => {
      if (!viewerUid || !canDeleteMessage(message, viewerUid)) return;
      if (!configured) {
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, deleted: true } : m)));
        return;
      }
      await chatRepository.softDelete(matchId, message.id);
    },
    [viewerUid, configured, matchId],
  );

  const close = useCallback(async () => {
    if (!viewerUid || !match || !canCloseMatch(match, viewerUid).ok) return;
    setMatch((prev) => (prev ? { ...prev, status: "closed" } : prev));
    if (configured) await matchRepository.close(matchId);
  }, [viewerUid, configured, match, matchId]);

  const setReveal = useCallback(
    async (reveal: boolean) => {
      if (!viewerUid || !match || !canSetPhotoReveal(match, viewerUid)) return;
      setMatch((prev) =>
        prev ? { ...prev, photoReveal: { ...prev.photoReveal, [viewerUid]: reveal } } : prev,
      );
      if (configured) await matchRepository.setPhotoReveal(matchId, reveal);
    },
    [viewerUid, configured, match, matchId],
  );

  return {
    messages,
    match,
    viewerUid,
    loading,
    preview: !configured,
    closed,
    send,
    remove,
    close,
    setReveal,
  };
}
