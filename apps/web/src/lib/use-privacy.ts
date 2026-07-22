"use client";

import { useCallback } from "react";
import {
  assembleMemberExport,
  DEFAULT_MEMBER_PREFERENCES,
  FREE_PLAN,
  type MemberExport,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { privacyRepository } from "@/infrastructure/firebase/privacy.repository";

/** Member privacy rights: self data export and account deletion. In preview
 * (no backend) the export bundle is assembled locally so the download works. */
export function usePrivacy(): {
  exportData: () => Promise<MemberExport>;
  deleteAccount: () => Promise<void>;
} {
  const { configured, user } = useAuth();

  const exportData = useCallback(async (): Promise<MemberExport> => {
    if (configured && user) return privacyRepository.exportMyData(user.uid);
    return assembleMemberExport({
      uid: user?.uid ?? "preview-member",
      profile: {
        displayName: "عضو المعاينة",
        country: "TR",
        city: "İstanbul",
        maritalStatus: "single",
        visibility: "visible",
      },
      preferences: DEFAULT_MEMBER_PREFERENCES,
      entitlement: { plan: FREE_PLAN.id, grantedAt: "2026-01-01T00:00:00.000Z", grantedBy: null },
    });
  }, [configured, user]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (configured && user) await privacyRepository.deleteMyAccount(user.uid);
  }, [configured, user]);

  return { exportData, deleteAccount };
}
