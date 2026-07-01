"use client";

import { useTranslations } from "next-intl";

export function StepShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const t = useTranslations("Captacion");

  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm font-medium text-brand-blue hover:underline"
        >
          ← {t("back")}
        </button>
      )}
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-2 text-foreground/60">{subtitle}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}
