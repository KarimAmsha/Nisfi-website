import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icon";

type Row = {
  id: string;
  initial: string;
  uid: string;
  type: "selfieId" | "idOnly";
  status: "pending" | "review" | "verified";
  ago: string;
  selected?: boolean;
};

const ROWS: Row[] = [
  {
    id: "1",
    initial: "A9",
    uid: "uid_9f3a…",
    type: "selfieId",
    status: "review",
    ago: "4m",
    selected: true,
  },
  { id: "2", initial: "K2", uid: "uid_2b7c…", type: "selfieId", status: "pending", ago: "11m" },
  { id: "3", initial: "R5", uid: "uid_5d1e…", type: "idOnly", status: "pending", ago: "26m" },
  { id: "4", initial: "T8", uid: "uid_8a0b…", type: "selfieId", status: "verified", ago: "1h" },
];

const STATUS_TONE = { pending: "pending", review: "info", verified: "success" } as const;

export default function AdminVerificationsPage() {
  const t = useTranslations("Admin.verifications");
  const statusLabel = {
    pending: t("statusPending"),
    review: t("statusReview"),
    verified: t("statusVerified"),
  };
  const typeLabel = { selfieId: t("typeSelfieId"), idOnly: t("typeIdOnly") };

  return (
    <AdminShell title={t("title")}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Queue */}
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
            <Badge tone="brand" className="tabular-nums">
              {t("waiting")}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-start">
                  {[t("colMember"), t("colType"), t("colStatus"), t("colSubmitted")].map((h) => (
                    <th
                      key={h}
                      className="border-b border-border px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-ink-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.id} className={r.selected ? "bg-primary-50" : undefined}>
                    <td className="border-b border-border px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-md bg-primary-700 text-xs font-bold text-white">
                          {r.initial}
                        </span>
                        <span className="text-xs text-ink-600 tabular-nums">{r.uid}</span>
                      </div>
                    </td>
                    <td className="border-b border-border px-5 py-3 text-ink">
                      {typeLabel[r.type]}
                    </td>
                    <td className="border-b border-border px-5 py-3">
                      <Badge tone={STATUS_TONE[r.status]} dot>
                        {statusLabel[r.status]}
                      </Badge>
                    </td>
                    <td className="border-b border-border px-5 py-3 text-xs text-ink-600 tabular-nums">
                      {r.ago}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail drawer */}
        <aside className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-bold text-ink">{t("drawerTitle")}</h2>
              <p className="text-xs text-ink-600 tabular-nums">uid_9f3a…</p>
            </div>
            <Badge tone="info" dot>
              {t("statusReview")}
            </Badge>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <div className="grid aspect-video place-items-center bg-linear-to-br from-primary-700 to-primary-600">
              <LockIcon size={36} className="text-primary-50/85" />
            </div>
            <p className="flex items-center gap-2 border-t border-border bg-canvas px-3 py-2 text-xs text-ink-600">
              <LockIcon size={14} />
              {t("evidenceNote")}
            </p>
          </div>

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600">{t("kvName")}</dt>
              <dd className="font-semibold text-ink">{t("valMatch")}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600">{t("kvLiveness")}</dt>
              <dd className="font-semibold text-ink">{t("valPass")}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600">{t("kvAccountAge")}</dt>
              <dd className="font-semibold text-ink">{t("valDays")}</dd>
            </div>
          </dl>

          <p className="rounded-md border border-border border-s-[3px] border-s-accent bg-canvas px-3 py-2.5 text-xs text-ink-600">
            {t("auditNote")}
          </p>

          <div className="flex gap-2.5">
            <Button size="sm">{t("approve")}</Button>
            <Button size="sm" variant="danger">
              {t("requestResend")}
            </Button>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
