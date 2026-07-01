"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-full border border-foreground/10 p-1 text-xs font-medium">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={loc === locale}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            loc === locale
              ? "bg-brand-blue text-white"
              : "text-foreground/60 hover:text-foreground",
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
