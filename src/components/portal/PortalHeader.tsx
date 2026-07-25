"use client";

import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { RevokeSessionsButton } from "@/components/auth/RevokeSessionsButton";
import { RegenerateRecoveryCodesButton } from "@/components/auth/RegenerateRecoveryCodesButton";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/portal/dashboard", key: "dashboard" },
  { href: "/portal/proyectos", key: "projects" },
  { href: "/portal/licencias", key: "licenses" },
  { href: "/portal/tickets", key: "tickets" },
  { href: "/portal/facturas", key: "invoices" },
  { href: "/portal/servicios", key: "services" },
] as const;

export function PortalHeader({
  displayId,
  fullName,
}: {
  displayId: string;
  fullName: string;
}) {
  const t = useTranslations("Portal");
  const pathname = usePathname();
  const router = useRouter();

  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 overflow-x-auto md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap text-sm font-medium transition-colors hover:text-brand-blue",
                pathname === item.href ? "text-brand-blue" : "text-foreground/70",
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/60 sm:inline">
            {t("clientId")}: {displayId}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
            {initials}
          </span>
          <RegenerateRecoveryCodesButton />
          <RevokeSessionsButton />
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t("logout")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:text-brand-blue"
          >
            <LogOut size={18} />
          </button>
        </div>
      </Container>

      <nav className="flex items-center gap-5 overflow-x-auto border-t border-foreground/10 px-6 py-3 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap text-sm font-medium",
              pathname === item.href ? "text-brand-blue" : "text-foreground/70",
            )}
          >
            {t(`nav.${item.key}`)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
