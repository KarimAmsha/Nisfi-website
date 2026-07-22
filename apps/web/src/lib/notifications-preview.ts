import type { AppNotification, Block } from "@nisfi/shared";

/** Preview seed (no backend) so the notifications center and blocked list are
 * demonstrable. Real data comes from Cloud Functions / Firestore once wired. */
export const PREVIEW_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "requestReceived",
    titleKey: "requestReceived.title",
    bodyKey: "requestReceived.body",
    params: { name: "آية" },
    link: "/app/requests",
    read: false,
    createdAt: "2026-03-18T09:00:00.000Z",
  },
  {
    id: "n2",
    type: "requestAccepted",
    titleKey: "requestAccepted.title",
    bodyKey: "requestAccepted.body",
    params: { name: "سُمَيّة" },
    link: "/app/matches",
    read: false,
    createdAt: "2026-03-17T12:00:00.000Z",
  },
  {
    id: "n3",
    type: "verificationApproved",
    titleKey: "verificationApproved.title",
    bodyKey: "verificationApproved.body",
    params: {},
    link: "/app/verification",
    read: true,
    createdAt: "2026-03-10T08:00:00.000Z",
  },
];

export const PREVIEW_BLOCKED: Block[] = [
  { targetUid: "p5", createdAt: "2026-03-12T08:00:00.000Z" },
];
