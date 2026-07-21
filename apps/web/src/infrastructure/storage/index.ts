import type { StorageService } from "@/core/ports/storage";
import {
  cloudinaryConfigured,
  cloudinaryStorageService,
} from "../cloudinary/cloudinary.storage.service";
import { mockStorageService } from "./mock.storage.service";

/** The active StorageService: Cloudinary when configured (O-002), otherwise the
 * preview mock (O-001). */
export function getStorageService(): StorageService {
  return cloudinaryConfigured() ? cloudinaryStorageService : mockStorageService;
}
