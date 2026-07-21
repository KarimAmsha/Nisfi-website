import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon } from "@/components/ui/icon";

export default function VerificationPage() {
  const t = useTranslations("Verification");
  return (
    <Card className="max-w-xl">
      <CardHeader className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-primary-50 text-primary-700">
          <ShieldCheckIcon />
        </span>
        <div className="flex flex-col gap-1">
          <CardTitle>{t("title")}</CardTitle>
          <Badge tone="info" dot className="w-fit">
            {t("statusLabel")}
          </Badge>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-ink-600">{t("desc")}</p>
        <Button variant="secondary" size="sm" className="w-fit">
          {t("cta")}
        </Button>
      </CardBody>
    </Card>
  );
}
