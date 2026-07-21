import type { Photo } from "@nisfi/shared";
import type { StorageService } from "@/core/ports/storage";

/**
 * Cloudinary storage adapter (owner decision O-002 — free image platform
 * instead of paid Firebase Storage).
 *
 * Privacy model (master spec Sections 10.14, 11.3):
 * - Originals are uploaded with delivery type `authenticated`/`private` and are
 *   never publicly readable.
 * - The public "blurred" view is an on-the-fly transformation (`e_blur`/
 *   `e_pixelate`) delivered via a signed URL.
 * - Photo reveal uses short-lived signed URLs minted server-side.
 * - Uploads are signed by a Cloud Function (the signature is never exposed);
 *   the browser posts the file to the Cloudinary upload endpoint.
 *
 * Real wiring (signature endpoint + credentials) is completed in the final
 * production step (O-001); this adapter is inactive until then.
 */
export function cloudinaryConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
}

function notWired(): never {
  throw new Error(
    "Cloudinary is not configured yet. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and the signed-upload endpoint during production wiring (O-001).",
  );
}

class CloudinaryStorageService implements StorageService {
  listPhotos(_uid: string): Promise<Photo[]> {
    return notWired();
  }
  uploadPhoto(_uid: string, _file: File): Promise<Photo[]> {
    return notWired();
  }
  reorderPhotos(_uid: string, _orderedIds: string[]): Promise<Photo[]> {
    return notWired();
  }
  deletePhoto(_uid: string, _photoId: string): Promise<Photo[]> {
    return notWired();
  }
}

export const cloudinaryStorageService: StorageService = new CloudinaryStorageService();
