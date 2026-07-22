import type { AppConfig, ConfigChange } from "@nisfi/shared";

/**
 * ConfigRepository port (master spec Section 6.2, F10). The admin console reads
 * the runtime config (merged over defaults) and applies one allow-listed change
 * at a time through a server-side content Cloud Function — validation, bounds,
 * and the old→new audit run on the server; clients never write `appConfig`.
 */
export interface ConfigRepository {
  /** The current runtime config, merged over `DEFAULT_APP_CONFIG`. */
  getConfig(): Promise<AppConfig>;
  /** Apply one validated flag/limit/content change (audited server-side). */
  updateConfig(change: ConfigChange): Promise<void>;
}
