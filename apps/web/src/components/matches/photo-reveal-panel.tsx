"use client";

import { useTranslations } from "next-intl";
import { counterpartyRevealed, isRevealingOwn, type Match } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { LockIcon, ShieldCheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/** Independent, revocable photo-reveal controls (master spec F7). Each side
 * toggles revealing THEIR photos; originals are fetched only via a short-lived
 * signed URL when the counterparty has revealed — never public, never cached.
 * Cloudinary signed delivery is wired in the production step (O-001/O-002), so
 * revealed originals show a placeholder here. */
export function PhotoRevealPanel({
  match,
  viewerUid,
  otherName,
  disabled,
  onToggle,
}: {
  match: Match;
  viewerUid: string;
  otherName: string;
  disabled: boolean;
  onToggle: (reveal: boolean) => void;
}) {
  const t = useTranslations("Reveal");
  const revealingOwn = isRevealingOwn(match, viewerUid);
  const theyRevealed = counterpartyRevealed(match, viewerUid);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface/70 p-3">
      {/* My reveal toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-ink">{t("myTitle")}</span>
          <span className="text-xs text-ink-600">{t("myHint", { name: otherName })}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={revealingOwn}
          disabled={disabled}
          onClick={() => onToggle(!revealingOwn)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
            revealingOwn ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white transition-[inset-inline-start]",
              revealingOwn ? "start-[1.375rem]" : "start-0.5",
            )}
          />
        </button>
      </div>

      {/* Counterparty photos */}
      <div className="flex items-center gap-3 border-t border-border pt-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-md text-white",
            theyRevealed ? "bg-primary-600" : "bg-linear-to-br from-primary-700 to-primary-600",
          )}
        >
          {theyRevealed ? <ShieldCheckIcon size={18} /> : <LockIcon size={18} />}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-ink">
            {theyRevealed ? t("theirRevealed", { name: otherName }) : t("theirHidden")}
          </span>
          <span className="text-xs text-ink-600">
            {theyRevealed ? t("theirRevealedHint") : t("mutualHint")}
          </span>
        </div>
        {theyRevealed ? (
          <Badge tone="success" className="ms-auto">
            {t("revealedBadge")}
          </Badge>
        ) : null}
      </div>
    </section>
  );
}
