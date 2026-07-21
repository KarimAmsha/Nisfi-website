"use client";

import { useEffect, useState } from "react";
import type { PublicProfile } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { profileRepository } from "@/infrastructure/firebase/profile.repository";
import { getPreviewProfile } from "@/lib/discovery-preview";

export interface CandidateProfileState {
  profile: PublicProfile | null;
  /** Count of protected (blurred) photos to present; originals are never
   * reachable client-side. Real counts come from approved photo metadata once
   * Cloudinary is wired (O-001). */
  photoCount: number;
  loading: boolean;
  /** True when the profile does not exist or the viewer is not eligible to see
   * it (the security rules deny ineligible reads server-side). */
  notFound: boolean;
}

/**
 * Loads another member's public profile for the detail view. When Firebase is
 * configured it reads through the `ProfileRepository` — the tightened
 * `profiles/{uid}` rule only returns visible + verified profiles to eligible
 * members, so an ineligible read surfaces as `notFound`. In preview it serves
 * the discovery seed so the page is demonstrable.
 */
export function useCandidateProfile(uid: string): CandidateProfileState {
  const { configured, user } = useAuth();
  const [state, setState] = useState<CandidateProfileState>({
    profile: null,
    photoCount: 0,
    loading: true,
    notFound: false,
  });

  useEffect(() => {
    let active = true;
    if (!configured) {
      const preview = getPreviewProfile(uid);
      setState({
        profile: preview?.profile ?? null,
        photoCount: preview?.photoCount ?? 0,
        loading: false,
        notFound: preview === null,
      });
      return;
    }
    if (!user) {
      setState({ profile: null, photoCount: 0, loading: false, notFound: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    void profileRepository
      .getPublic(uid)
      .then((profile) => {
        if (!active) return;
        // Photo metadata + protected-media counts arrive with Cloudinary (O-001).
        setState({ profile, photoCount: 0, loading: false, notFound: profile === null });
      })
      .catch(() => {
        if (!active) return;
        setState({ profile: null, photoCount: 0, loading: false, notFound: true });
      });
    return () => {
      active = false;
    };
  }, [configured, user, uid]);

  return state;
}
