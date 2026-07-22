import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <NotificationCenter />;
}
