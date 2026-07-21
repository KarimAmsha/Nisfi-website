"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { canSubmitVerification, type VerificationRequest } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { LockIcon, ShieldCheckIcon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { verificationRepository } from "@/infrastructure/firebase/verification.repository";

function FilePicker({ label, onPick }: { label: string; onPick: (has: boolean) => void }) {
  const t = useTranslations("Verification");
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          {name ? t("chosen") : label}
        </button>
        {name ? <span className="truncate text-xs text-ink-600">{name}</span> : null}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setName(file?.name ?? null);
          onPick(file !== null);
        }}
      />
    </div>
  );
}

export function VerificationFlow() {
  const t = useTranslations("Verification");
  const { user, configured } = useAuth();
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [hasId, setHasId] = useState(false);
  const [hasSelfie, setHasSelfie] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (configured && user) {
      void verificationRepository.getOwn(user.uid).then(setRequest);
    }
  }, [configured, user]);

  const onSubmit = async () => {
    setBusy(true);
    try {
      if (configured && user) {
        // The private selfie/ID upload happens here in production wiring.
        setRequest(await verificationRepository.submit(user.uid, "selfieId"));
      } else {
        setRequest({
          id: "preview",
          uid: "preview",
          type: "selfieId",
          status: "pending",
          reason: null,
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      setBusy(false);
    }
  };

  if (request?.status === "pending") {
    return (
      <StatusCard tone="info" badge={t("pendingTitle")} title={t("pendingTitle")}>
        <p className="text-sm leading-relaxed text-ink-600">{t("pendingDesc")}</p>
      </StatusCard>
    );
  }

  if (request?.status === "approved") {
    return (
      <StatusCard tone="success" badge={t("approvedTitle")} title={t("approvedTitle")}>
        <p className="text-sm leading-relaxed text-ink-600">{t("approvedDesc")}</p>
        <Link href="/app" className={buttonVariants({ size: "sm" })}>
          {t("continueApp")}
        </Link>
      </StatusCard>
    );
  }

  const rejected = request?.status === "rejected";
  const canSubmit = canSubmitVerification(request) && hasId && hasSelfie;

  return (
    <Card className="max-w-xl">
      <CardHeader className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-primary-50 text-primary-700">
          <ShieldCheckIcon />
        </span>
        <CardTitle>{rejected ? t("rejectedTitle") : t("title")}</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-ink-600">
          {rejected ? t("rejectedDesc") : t("intro")}
        </p>

        {rejected && request?.reason ? (
          <p className="rounded-md border border-border border-s-[3px] border-s-danger bg-danger/5 px-3 py-2 text-sm text-ink-600">
            <span className="font-semibold text-danger">{t("reasonLabel")}: </span>
            {request.reason}
          </p>
        ) : null}

        <FilePicker label={t("uploadIdLabel")} onPick={setHasId} />
        <FilePicker label={t("uploadSelfieLabel")} onPick={setHasSelfie} />

        <p className="flex items-start gap-2 rounded-md bg-primary-50/50 px-3 py-2.5 text-xs text-ink-600">
          <LockIcon size={16} className="mt-0.5 shrink-0 text-primary-700" />
          {t("selfiePrivacyNote")}
        </p>

        <Button
          size="sm"
          className="w-fit"
          loading={busy}
          disabled={!canSubmit}
          onClick={() => void onSubmit()}
        >
          {rejected ? t("retry") : t("submit")}
        </Button>
        {!configured ? <p className="text-xs text-ink-600">{t("previewNote")}</p> : null}
      </CardBody>
    </Card>
  );
}

function StatusCard({
  tone,
  badge,
  title,
  children,
}: {
  tone: "info" | "success";
  badge: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="max-w-xl">
      <CardHeader className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-primary-50 text-primary-700">
          <ShieldCheckIcon />
        </span>
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          <Badge tone={tone} dot className="w-fit">
            {badge}
          </Badge>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">{children}</CardBody>
    </Card>
  );
}
