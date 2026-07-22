"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ACCOUNT_STATUSES,
  canAssignRole,
  canSetAccountStatus,
  ROLES,
  type AccountStatus,
  type AdminUser,
  type Role,
  type UserFilter,
} from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon, UsersIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { useAdmin } from "@/lib/use-admin";
import { useUsersAdmin } from "@/lib/use-users-admin";

function statusTone(status: AccountStatus) {
  if (status === "active") return "success" as const;
  if (status === "suspended") return "pending" as const;
  return "danger" as const;
}

function roleTone(role: Role) {
  return role === "user" ? ("neutral" as const) : ("brand" as const);
}

function Detail({
  target,
  actorRole,
  actorUid,
  onAssignRole,
  onSetStatus,
}: {
  target: AdminUser;
  actorRole: Role;
  actorUid: string;
  onAssignRole: (role: Role) => void;
  onSetStatus: (status: AccountStatus) => void;
}) {
  const t = useTranslations("Admin.users");
  const roleAssignable = canAssignRole(actorRole, actorUid, target.uid, target.role).ok;

  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-bold text-ink">{target.displayName ?? t("noName")}</h2>
          <p className="text-xs text-ink-600 tabular-nums">{target.uid}</p>
        </div>
        <Badge tone={statusTone(target.status)} dot>
          {t(`status.${target.status}` as "status.active")}
        </Badge>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("email")}</dt>
          <dd className="truncate font-medium text-ink">{target.email ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("role")}</dt>
          <dd>
            <Badge tone={roleTone(target.role)}>{t(`roles.${target.role}` as "roles.user")}</Badge>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("joined")}</dt>
          <dd className="text-xs text-ink-600 tabular-nums">{target.createdAt.slice(0, 10)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {roleAssignable ? (
          <SelectField
            label={t("roleAssign")}
            value={target.role}
            onChange={(e) => onAssignRole(e.target.value as Role)}
            options={ROLES.map((r) => ({ value: r, label: t(`roles.${r}` as "roles.user") }))}
          />
        ) : (
          <>
            <span className="text-xs font-semibold text-ink-600">{t("roleAssign")}</span>
            <p className="text-xs text-ink-600">{t("roleAssignLocked")}</p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <span className="text-xs font-semibold text-ink-600">{t("statusActions")}</span>
        <div className="flex flex-wrap gap-2">
          {ACCOUNT_STATUSES.filter((s) => s !== target.status).map((s) => {
            const allowed = canSetAccountStatus(actorRole, actorUid, target, s).ok;
            if (!allowed) return null;
            return (
              <Button
                key={s}
                size="sm"
                variant={s === "banned" || s === "suspended" ? "danger" : "ghost"}
                onClick={() => onSetStatus(s)}
              >
                {t(`statusAction.${s}` as "statusAction.active")}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-ink-600">{t("auditNote")}</p>
      </div>
    </aside>
  );
}

export function UsersAdmin() {
  const t = useTranslations("Admin.users");
  const { role } = useAdmin();
  const { user } = useAuth();
  const actorUid = user?.uid ?? "__me__";
  const { users, loading, error, preview, filter, setFilter, assignRole, setStatus } =
    useUsersAdmin();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (users.length === 0) setSelectedId(null);
    else if (!users.some((u) => u.uid === selectedId)) setSelectedId(users[0]?.uid ?? null);
  }, [users, selectedId]);

  const selected = users.find((u) => u.uid === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-56 flex-1">
          <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-ink-600">
            <SearchIcon size={16} />
          </span>
          <input
            type="search"
            value={filter.query ?? ""}
            onChange={(e) => setFilter({ ...filter, query: e.target.value })}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className={cn(
              "h-11 w-full rounded-md border border-border bg-surface ps-9 pe-3 text-sm text-ink",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          />
        </div>
        <SelectField
          label={t("filterRole")}
          value={filter.role ?? ""}
          onChange={(e) => {
            const next: UserFilter = { ...filter };
            if (e.target.value === "") delete next.role;
            else next.role = e.target.value as Role;
            setFilter(next);
          }}
          placeholder={t("filterAll")}
          options={ROLES.map((r) => ({ value: r, label: t(`roles.${r}` as "roles.user") }))}
        />
        <SelectField
          label={t("filterStatus")}
          value={filter.status ?? ""}
          onChange={(e) => {
            const next: UserFilter = { ...filter };
            if (e.target.value === "") delete next.status;
            else next.status = e.target.value as AccountStatus;
            setFilter(next);
          }}
          placeholder={t("filterAll")}
          options={ACCOUNT_STATUSES.map((s) => ({
            value: s,
            label: t(`status.${s}` as "status.active"),
          }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
            <Badge tone="brand" className="tabular-nums">
              {users.length}
            </Badge>
            {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-5">
              <EmptyState
                icon={<UsersIcon />}
                title={t("errorTitle")}
                description={t("errorBody")}
              />
            </div>
          ) : users.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<UsersIcon size={22} />}
                title={t("emptyTitle")}
                description={t("emptyDesc")}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((u) => (
                <li key={u.uid}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(u.uid)}
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-3 text-start transition-colors hover:bg-primary-50/50",
                      u.uid === selectedId ? "bg-primary-50" : undefined,
                    )}
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-primary-50 text-primary-700">
                      <UsersIcon size={16} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-ink">
                        {u.displayName ?? t("noName")}
                      </span>
                      <span className="truncate text-xs text-ink-600 tabular-nums">{u.uid}</span>
                    </span>
                    <Badge tone={roleTone(u.role)}>{t(`roles.${u.role}` as "roles.user")}</Badge>
                    <Badge tone={statusTone(u.status)} dot>
                      {t(`status.${u.status}` as "status.active")}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected ? (
          <Detail
            target={selected}
            actorRole={role}
            actorUid={actorUid}
            onAssignRole={(r) => void assignRole(selected, r)}
            onSetStatus={(s) => void setStatus(selected, s)}
          />
        ) : (
          <aside className="grid place-items-center rounded-lg border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-ink-600">
            {t("selectHint")}
          </aside>
        )}
      </div>
    </div>
  );
}
