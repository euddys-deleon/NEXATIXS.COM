"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Link } from "@/i18n/navigation";
import { Checkbox } from "@/components/ui/Checkbox";

export function LegalCheckbox({
  registerProps,
  invalid,
}: {
  registerProps: UseFormRegisterReturn;
  invalid?: boolean;
}) {
  const t = useTranslations("Captacion");

  return (
    <label className="flex items-start gap-2.5 text-sm text-foreground/70">
      <Checkbox invalid={invalid} {...registerProps} />
      <span>
        {t.rich("legalCheckbox", {
          privacy: (chunks) => (
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              className="text-brand-blue hover:underline"
            >
              {chunks}
            </Link>
          ),
          terms: (chunks) => (
            <Link
              href="/terminos-de-servicio"
              target="_blank"
              className="text-brand-blue hover:underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </span>
    </label>
  );
}
