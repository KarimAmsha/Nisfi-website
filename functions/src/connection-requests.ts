import {
  canSendRequest,
  makePairKey,
  REQUEST_LIMITS_FALLBACK,
  type ConnectionRequest,
  type RequestLimits,
  type SendRequestDecision,
} from "@nisfi/shared";

/**
 * CF6 `sendConnectionRequest` enforcement core (master spec Section 12, F5).
 *
 * The deployed callable runs this inside a single Firestore transaction: it
 * re-reads the sender's eligibility + counters and the pair's latest request,
 * calls {@link evaluateSendRequest}, and on `ok` writes the new `pending`
 * request and bumps the sender's counters atomically. Keeping the decision here
 * (over the shared rule) means the client preflight and the server authority
 * cannot drift. The `firebase-functions`/`firebase-admin` wiring is added in the
 * final production step (O-001); this module stays SDK-free and unit-testable.
 */
export interface SendRequestReadState {
  senderUid: string;
  recipientUid: string;
  senderEligible: boolean;
  recipientEligible: boolean;
  pendingSentCount: number;
  sentToday: number;
  latestForPair: Pick<ConnectionRequest, "status" | "respondedAt" | "createdAt"> | null;
  limits?: RequestLimits;
  now?: Date;
}

export type EvaluateSendResult =
  | { ok: true; pairKey: string; request: Omit<ConnectionRequest, "id" | "createdAt"> }
  | (SendRequestDecision & { ok: false });

/** Decide whether a send is allowed and, if so, the request document to create. */
export function evaluateSendRequest(
  state: SendRequestReadState,
  message: string,
): EvaluateSendResult {
  const decision = canSendRequest({
    senderUid: state.senderUid,
    recipientUid: state.recipientUid,
    senderEligible: state.senderEligible,
    recipientEligible: state.recipientEligible,
    pendingSentCount: state.pendingSentCount,
    sentToday: state.sentToday,
    latestForPair: state.latestForPair,
    limits: state.limits ?? REQUEST_LIMITS_FALLBACK,
    ...(state.now ? { now: state.now } : {}),
  });
  if (!decision.ok) return decision;
  return {
    ok: true,
    pairKey: makePairKey(state.senderUid, state.recipientUid),
    request: {
      pairKey: makePairKey(state.senderUid, state.recipientUid),
      fromUid: state.senderUid,
      toUid: state.recipientUid,
      message,
      status: "pending",
      respondedAt: null,
    },
  };
}
