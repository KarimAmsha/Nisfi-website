"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  canCreateReport,
  REPORT_DETAILS_MAX,
  REPORT_REASONS,
  reportInputSchema,
  type ReportReason,
} from "@nisfi/shared";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { reportRepository } from "@/infrastructure/firebase/report.repository";

/** Member report affordance (master spec F8). Files an `open` report about the
 * profile; the rules enforce the shape and triage is staff-only. */
export function ReportButton({ targetUid }: { targetUid: string }) {
  const t = useTranslations("Report");
  const { configured, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [details, setDetails] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    const parsed = reportInputSchema.safeParse({
      targetUid,
      targetType: "profile",
      reason,
      details,
    });
    if (!parsed.success) return;
    if (configured && user && !canCreateReport(user.uid, targetUid)) return;
    setPhase("sending");
    try {
      if (configured && user) await reportRepository.createReport(user.uid, parsed.data);
      setPhase("sent");
    } catch {
      setPhase("error");
    }
  }

  if (phase === "sent") {
    return <p className="text-center text-xs text-ink-600">{t("sentNote")}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-ink-600 underline-offset-2 hover:text-danger hover:underline"
      >
        {t("cta")}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-canvas p-3">
      <SelectField
        label={t("reasonLabel")}
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        options={REPORT_REASONS.map((r) => ({
          value: r,
          label: t(`reasons.${r}` as "reasons.other"),
        }))}
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={2}
        maxLength={REPORT_DETAILS_MAX}
        placeholder={t("detailsPlaceholder")}
        aria-label={t("detailsPlaceholder")}
        className={cn(
          "w-full resize-none rounded-md border border-border bg-surface p-2.5 text-sm text-ink",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      />
      {phase === "error" ? <p className="text-xs text-danger">{t("error")}</p> : null}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="danger"
          loading={phase === "sending"}
          onClick={() => void submit()}
        >
          {t("submit")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
