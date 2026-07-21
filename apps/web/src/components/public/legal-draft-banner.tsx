import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

/** Prominent draft/legal-review notice for legal pages (master spec Unit 1.2:
 * "clear draft/legal-review labeling", "no invented legal assurances"). */
export function LegalDraftBanner() {
  const t = useTranslations("Legal");
  return (
    <div
      role="note"
      className="mb-8 flex flex-col gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4"
    >
      <div className="flex items-center gap-2">
        <Badge tone="pending">{t("draftBadge")}</Badge>
        <span className="text-sm font-semibold text-ink">{t("underReview")}</span>
      </div>
      <p className="text-sm text-ink-600">{t("draftNotice")}</p>
    </div>
  );
}
