import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="text-lg text-foreground/70">{t("tagline")}</p>
      <p className="max-w-md text-sm text-foreground/50">{t("placeholder")}</p>
    </main>
  );
}
