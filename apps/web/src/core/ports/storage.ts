import type { Photo } from "@nisfi/shared";

/**
 * StorageService port (master spec Section 5.2). Backend-agnostic photo
 * operations; the concrete adapter targets the free image platform
 * (Cloudinary, O-002) or a mock in preview. Originals are private; the public
 * blurred view and short-lived reveal URLs are produced at the adapter level.
 */
export interface StorageService {
  listPhotos(uid: string): Promise<Photo[]>;
  uploadPhoto(uid: string, file: File): Promise<Photo[]>;
  reorderPhotos(uid: string, orderedIds: string[]): Promise<Photo[]>;
  deletePhoto(uid: string, photoId: string): Promise<Photo[]>;
}
