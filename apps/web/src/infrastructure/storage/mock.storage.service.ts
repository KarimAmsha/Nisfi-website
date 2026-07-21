import type { Photo } from "@nisfi/shared";
import type { StorageService } from "@/core/ports/storage";

/**
 * In-memory mock storage used in preview (no image-platform credentials yet,
 * O-001). Owner previews use object URLs so the owner sees their own uploads;
 * new photos start `pending` moderation. Real uploads/blur/reveal are handled
 * by the Cloudinary adapter once configured.
 */
const store = new Map<string, Photo[]>();

function reindex(photos: Photo[]): Photo[] {
  return photos.map((photo, index) => ({ ...photo, order: index }));
}

class MockStorageService implements StorageService {
  listPhotos(uid: string): Promise<Photo[]> {
    return Promise.resolve(store.get(uid) ?? []);
  }

  uploadPhoto(uid: string, file: File): Promise<Photo[]> {
    const current = store.get(uid) ?? [];
    const photo: Photo = {
      id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      order: current.length,
      moderation: "pending",
      ownerPreviewUrl: typeof URL !== "undefined" ? URL.createObjectURL(file) : null,
      createdAt: new Date().toISOString(),
    };
    const next = [...current, photo];
    store.set(uid, next);
    return Promise.resolve(next);
  }

  reorderPhotos(uid: string, orderedIds: string[]): Promise<Photo[]> {
    const current = store.get(uid) ?? [];
    const byId = new Map(current.map((photo) => [photo.id, photo]));
    const next = reindex(
      orderedIds.map((id) => byId.get(id)).filter((photo): photo is Photo => photo !== undefined),
    );
    store.set(uid, next);
    return Promise.resolve(next);
  }

  deletePhoto(uid: string, photoId: string): Promise<Photo[]> {
    const current = store.get(uid) ?? [];
    const next = reindex(current.filter((photo) => photo.id !== photoId));
    store.set(uid, next);
    return Promise.resolve(next);
  }
}

export const mockStorageService: StorageService = new MockStorageService();
