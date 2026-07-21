import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <p className="text-sm leading-relaxed text-ink-600">{t("note")}</p>
      </CardBody>
    </Card>
  );
}
