import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { QuestionsAdmin } from "@/components/admin/questions-admin";

export default function AdminQuestionsPage() {
  const t = useTranslations("Admin.questions");
  return (
    <AdminShell title={t("title")}>
      <QuestionsAdmin />
    </AdminShell>
  );
}
