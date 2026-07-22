import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched paths under a locale. It forces the localized
 * `[locale]/not-found.tsx` (rendered inside the locale layout, so it is RTL-
 * aware and branded) instead of falling through to the bare root fallback.
 */
export default function CatchAllNotFound() {
  notFound();
}
