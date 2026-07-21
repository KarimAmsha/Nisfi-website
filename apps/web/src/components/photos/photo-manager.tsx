"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MAX_PHOTOS, validatePhotoFile, type Photo, type PhotoModeration } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import { getStorageService } from "@/infrastructure/storage";

const MODERATION_TONE: Record<PhotoModeration, "pending" | "success" | "danger"> = {
  pending: "pending",
  approved: "success",
  rejected: "danger",
};

export function PhotoManager() {
  const t = useTranslations("Photos");
  const { user } = useAuth();
  const uid = user?.uid ?? "preview-user";
  const storage = useMemo(() => getStorageService(), []);
  const inputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void storage.listPhotos(uid).then(setPhotos);
  }, [storage, uid]);

  const moderationLabel: Record<PhotoModeration, string> = {
    pending: t("moderationPending"),
    approved: t("moderationApproved"),
    rejected: t("moderationRejected"),
  };

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const problem = validatePhotoFile(file, photos.length);
    if (problem) {
      const key = { type: "errorType", size: "errorSize", limit: "errorLimit" } as const;
      setError(t(key[problem]));
      return;
    }
    setPhotos(await storage.uploadPhoto(uid, file));
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const ids = photos.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    setPhotos(await storage.reorderPhotos(uid, ids));
  };

  const remove = async (photoId: string) => {
    setPhotos(await storage.deletePhoto(uid, photoId));
  };

  const atLimit = photos.length >= MAX_PHOTOS;

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-[56ch] text-sm text-ink-600">{t("subtitle")}</p>
      </header>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => inputRef.current?.click()} disabled={atLimit}>
          {t("add")}
        </Button>
        <span className="text-sm text-ink-600 tabular-nums">
          {t("count", { count: photos.length, max: MAX_PHOTOS })}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-xs text-ink-600">{t("addHint")}</p>

      {error ? (
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <p className="flex items-start gap-2 rounded-md border border-border bg-primary-50/40 px-3 py-2.5 text-xs text-ink-600">
        <LockIcon size={16} className="mt-0.5 shrink-0 text-primary-700" />
        {t("privacyNote")}
      </p>

      {photos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/60 px-6 py-12 text-center text-sm text-ink-600">
          {t("empty")}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-lg border border-border bg-surface shadow-card"
            >
              <div className="relative aspect-square bg-linear-to-br from-primary-700 to-primary-600">
                {photo.ownerPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- owner-only object-URL preview
                  <img src={photo.ownerPreviewUrl} alt="" className="size-full object-cover" />
                ) : null}
                <span className="absolute start-2 top-2">
                  <Badge tone={MODERATION_TONE[photo.moderation]} dot>
                    {moderationLabel[photo.moderation]}
                  </Badge>
                </span>
                {index === 0 ? (
                  <span className="absolute end-2 top-2 rounded-full bg-primary-700/85 px-2 py-0.5 text-[0.7rem] font-semibold text-white">
                    1
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => void move(index, -1)}
                    disabled={index === 0}
                    aria-label={t("moveEarlier")}
                    className="grid size-8 place-items-center rounded-md text-ink-600 hover:bg-primary-50 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => void move(index, 1)}
                    disabled={index === photos.length - 1}
                    aria-label={t("moveLater")}
                    className="grid size-8 place-items-center rounded-md text-ink-600 hover:bg-primary-50 disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(photo.id)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  {t("delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
