import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { LockIcon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm leading-relaxed text-ink-600">{t("note")}</p>
        </CardBody>
      </Card>

      <Link
        href="/app/settings/blocked"
        className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40"
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary-50 text-primary-700">
          <LockIcon size={19} />
        </span>
        <span className="flex flex-col">
          <span className="font-semibold text-ink">{t("blockedLink")}</span>
          <span className="text-sm text-ink-600">{t("blockedHint")}</span>
        </span>
      </Link>
    </div>
  );
}
