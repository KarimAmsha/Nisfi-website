import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { DEFAULT_APP_CONFIG, type AppConfig, type ConfigChange } from "@nisfi/shared";
import type { ConfigRepository } from "@/core/ports/config";
import { firebaseFirestore, firebaseFunctions } from "./client";

/** Merge a stored config document over the defaults so a missing key or section
 * always falls back rather than reading `undefined`. */
function mergeConfig(data: Record<string, unknown> | undefined): AppConfig {
  const stored = data ?? {};
  return {
    flags: { ...DEFAULT_APP_CONFIG.flags, ...(stored.flags as AppConfig["flags"] | undefined) },
    limits: { ...DEFAULT_APP_CONFIG.limits, ...(stored.limits as AppConfig["limits"] | undefined) },
    content: {
      ...DEFAULT_APP_CONFIG.content,
      ...(stored.content as AppConfig["content"] | undefined),
    },
  };
}

class FirestoreConfigRepository implements ConfigRepository {
  async getConfig(): Promise<AppConfig> {
    const snap = await getDoc(doc(firebaseFirestore(), "appConfig", "platform"));
    return mergeConfig(snap.exists() ? snap.data() : undefined);
  }

  async updateConfig(change: ConfigChange): Promise<void> {
    const callable = httpsCallable<{ change: ConfigChange }, void>(
      firebaseFunctions(),
      "updateConfig",
    );
    await callable({ change });
  }
}

export const configRepository: ConfigRepository = new FirestoreConfigRepository();
