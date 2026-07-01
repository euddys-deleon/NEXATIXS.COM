import { useTranslations } from "next-intl";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function IniciarSesionPage() {
  const t = useTranslations("ComingSoon");
  return <ComingSoon title={t("loginTitle")} body={t("loginBody")} />;
}
