"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/prospectos", key: "prospects" },
  { href: "/admin/clientes", key: "clients" },
  { href: "/admin/planes", key: "plans" },
  { href: "/admin/auditoria", key: "audit" },
] as const;

const superadminNavItem = { href: "/superadmin", key: "superadmin" } as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/superadmin") return pathname === "/superadmin";
  return pathname.startsWith(href);
}

export function AdminHeader({ fullName, isSuperadmin }: { fullName: string; isSuperadmin?: boolean }) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const router = useRouter();

  const navItems = isSuperadmin ? [superadminNavItem, ...baseNavItems] : baseNavItems;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-blue",
                isActive(pathname, item.href) ? "text-brand-blue" : "text-foreground/70",
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-foreground/60 sm:inline">{fullName}</span>
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
              isActive(pathname, item.href) ? "text-brand-blue" : "text-foreground/70",
            )}
          >
            {t(`nav.${item.key}`)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
