import { useTranslations } from "next-intl";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function AgendarCitaPage() {
  const t = useTranslations("ComingSoon");
  return <ComingSoon title={t("bookingTitle")} body={t("bookingBody")} />;
}
