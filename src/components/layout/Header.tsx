"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" },
  { href: "/nosotros", key: "about" },
  { href: "/servicios", key: "services" },
  { href: "/soluciones", key: "solutions" },
  { href: "/proyectos", key: "projects" },
  { href: "/herramientas", key: "tools" },
  { href: "/planes", key: "plans" },
  { href: "/noticias", key: "news" },
  { href: "/soporte", key: "support" },
  { href: "/contacto", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Logo className="shrink-0" />

        <nav className="hidden min-w-0 items-center gap-4 xl:flex xl:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap text-sm font-medium transition-colors hover:text-brand-blue",
                pathname === item.href ? "text-brand-blue" : "text-foreground/70",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <Link href="/iniciar-sesion" className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("login")}
          </Link>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("menu")}
          aria-expanded={open}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground xl:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-foreground/10 xl:hidden"
          >
            <Container className="flex flex-col gap-4 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-base font-medium",
                    pathname === item.href ? "text-brand-blue" : "text-foreground",
                  )}
                >
                  {t(item.key)}
                </Link>
              ))}
              <Link
                href="/iniciar-sesion"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                {t("login")}
              </Link>
              <div className="flex items-center justify-end pt-2">
                <ThemeToggle />
              </div>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
