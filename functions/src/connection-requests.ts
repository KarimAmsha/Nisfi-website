import {
  canSendRequest,
  canTransitionRequest,
  makePairKey,
  REQUEST_LIMITS_FALLBACK,
  type ConnectionRequest,
  type RequestAction,
  type RequestLimits,
  type SendRequestDecision,
  type TransitionDecision,
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

/**
 * CF7 `respondToConnectionRequest` / `withdrawConnectionRequest` core. The
 * deployed callable re-reads the request inside a transaction, calls this, and
 * on `ok` writes `{ status: nextStatus, respondedAt }` and updates counters —
 * plus, on `accept`, creates `matches/{pairKey}` idempotently (Unit 4.1). Only
 * a `pending` request transitions; permissions are role-based (recipient
 * accepts/declines, sender withdraws).
 */
export interface TransitionReadState {
  actorUid: string;
  fromUid: string;
  toUid: string;
  status: ConnectionRequest["status"];
}

export function evaluateTransition(
  action: RequestAction,
  state: TransitionReadState,
): TransitionDecision {
  return canTransitionRequest(action, {
    actorUid: state.actorUid,
    fromUid: state.fromUid,
    toUid: state.toUid,
    status: state.status,
  });
}
