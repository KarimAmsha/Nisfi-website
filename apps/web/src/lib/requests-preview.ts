import { makePairKey, type ConnectionRequest } from "@nisfi/shared";
import { PREVIEW_VIEWER } from "@/lib/discovery-preview";

/** Preview request seed (no backend) so the request center is demonstrable.
 * Counterparties reference the discovery preview profiles. */
const me = PREVIEW_VIEWER.uid;

function req(
  id: string,
  fromUid: string,
  toUid: string,
  message: string,
  status: ConnectionRequest["status"],
  createdAt: string,
  respondedAt: string | null = null,
): ConnectionRequest {
  return { id, pairKey: makePairKey(fromUid, toUid), fromUid, toUid, message, status, createdAt, respondedAt };
}

export const PREVIEW_RECEIVED: ConnectionRequest[] = [
  req(
    "rin1",
    "p3",
    me,
    "السلام عليكم، أعجبني توافق قيمنا وأودّ التعرّف بنيّة الزواج.",
    "pending",
    "2026-03-18T09:00:00.000Z",
  ),
  req(
    "rin2",
    "p6",
    me,
    "أهلًا، أقدّر جديّتك وأرى بيننا توافقًا. هل نتعرّف أكثر؟",
    "pending",
    "2026-03-16T14:00:00.000Z",
  ),
];

export const PREVIEW_SENT: ConnectionRequest[] = [
  req(
    "rout1",
    me,
    "p1",
    "السلام عليكم، أودّ التعرّف بنيّة الزواج إن شاء الله.",
    "pending",
    "2026-03-17T10:00:00.000Z",
  ),
  req(
    "rout2",
    me,
    "p5",
    "أهلًا، هل لديكِ استعداد للتعرّف؟",
    "declined",
    "2026-03-10T08:00:00.000Z",
    "2026-03-11T08:00:00.000Z",
  ),
];
