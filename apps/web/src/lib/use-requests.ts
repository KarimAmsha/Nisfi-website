"use client";

import { useCallback, useEffect, useState } from "react";
import {
  canTransitionRequest,
  type ConnectionRequest,
  type RequestAction,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { connectionRequestRepository } from "@/infrastructure/firebase/connection-request.repository";
import { PREVIEW_RECEIVED, PREVIEW_SENT } from "@/lib/requests-preview";
import { PREVIEW_VIEWER } from "@/lib/discovery-preview";

export interface UseRequestsResult {
  received: ConnectionRequest[];
  sent: ConnectionRequest[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  /** Apply a transition (accept/decline/withdraw) to a request. */
  act: (request: ConnectionRequest, action: RequestAction) => Promise<void>;
  reload: () => void;
}

export function useRequests(): UseRequestsResult {
  const { configured, user } = useAuth();
  const actorUid = configured ? user?.uid : PREVIEW_VIEWER.uid;
  const [received, setReceived] = useState<ConnectionRequest[]>([]);
  const [sent, setSent] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setReceived(PREVIEW_RECEIVED);
      setSent(PREVIEW_SENT);
      setLoading(false);
      return;
    }
    if (!user) {
      setReceived([]);
      setSent([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    Promise.all([
      connectionRequestRepository.listReceived(user.uid),
      connectionRequestRepository.listSent(user.uid),
    ])
      .then(([r, s]) => {
        setReceived(r);
        setSent(s);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const applyLocal = (request: ConnectionRequest, nextStatus: ConnectionRequest["status"]) => {
    const patch = (list: ConnectionRequest[]) =>
      list.map((r) =>
        r.id === request.id
          ? { ...r, status: nextStatus, respondedAt: new Date().toISOString() }
          : r,
      );
    setReceived(patch);
    setSent(patch);
  };

  const act = useCallback(
    async (request: ConnectionRequest, action: RequestAction) => {
      if (!actorUid) return;
      const decision = canTransitionRequest(action, {
        actorUid,
        fromUid: request.fromUid,
        toUid: request.toUid,
        status: request.status,
      });
      if (!decision.ok) return;

      if (!configured) {
        applyLocal(request, decision.nextStatus);
        return;
      }
      if (action === "withdraw") {
        await connectionRequestRepository.withdraw(request.id);
      } else {
        await connectionRequestRepository.respond(request.id, action);
      }
      applyLocal(request, decision.nextStatus);
    },
    [actorUid, configured],
  );

  return { received, sent, loading, error, preview: !configured, act, reload: load };
}
