import { useTranslations } from "next-intl";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function ConsultaEstatusPage() {
  const t = useTranslations("ComingSoon");
  return <ComingSoon title={t("statusTitle")} body={t("statusBody")} />;
}
