import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import type { Locale } from "@nisfi/shared";
import { routing } from "./routing";

async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  const imported = (await import(`../../messages/${locale}.json`)) as {
    default: Record<string, unknown>;
  };
  return imported.default;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
