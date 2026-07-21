"use client";

import { useEffect, useState } from "react";
import type { PublicProfile } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { profileRepository } from "@/infrastructure/firebase/profile.repository";

/** Loads the signed-in member's own profile via the repository (when Firebase is
 * configured). In preview it stays `null` — surfaces prompt completion rather
 * than blocking. */
export function useOwnProfile(): { profile: PublicProfile | null; loading: boolean } {
  const { user, configured } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured || !user) {
      setLoading(false);
      return;
    }
    let active = true;
    void profileRepository.getOwn(user.uid).then((result) => {
      if (active) {
        setProfile(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [configured, user]);

  return { profile, loading };
}
