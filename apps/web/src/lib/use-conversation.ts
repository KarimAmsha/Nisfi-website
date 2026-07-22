"use client";

import { useCallback, useEffect, useState } from "react";
import { canDeleteMessage, isValidMessageText, type ChatMessage } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { chatRepository } from "@/infrastructure/firebase/chat.repository";
import { getPreviewMessages } from "@/lib/chat-preview";
import { PREVIEW_VIEWER } from "@/lib/discovery-preview";

export interface UseConversationResult {
  messages: ChatMessage[];
  viewerUid: string | undefined;
  loading: boolean;
  preview: boolean;
  send: (text: string) => Promise<void>;
  remove: (message: ChatMessage) => Promise<void>;
}

export function useConversation(matchId: string): UseConversationResult {
  const { configured, user } = useAuth();
  const viewerUid = configured ? user?.uid : PREVIEW_VIEWER.uid;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setMessages(getPreviewMessages(matchId));
      setLoading(false);
      return;
    }
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = chatRepository.listen(matchId, (next) => {
      setMessages(next);
      setLoading(false);
    });
    return unsub;
  }, [configured, user, matchId]);

  const send = useCallback(
    async (text: string) => {
      if (!viewerUid || !isValidMessageText(text)) return;
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
    [viewerUid, configured, matchId],
  );

  const remove = useCallback(
    async (message: ChatMessage) => {
      if (!viewerUid || !canDeleteMessage(message, viewerUid)) return;
      if (!configured) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, deleted: true } : m)),
        );
        return;
      }
      await chatRepository.softDelete(matchId, message.id);
    },
    [viewerUid, configured, matchId],
  );

  return { messages, viewerUid, loading, preview: !configured, send, remove };
}
