"use client";

import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const pathname = usePathname();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    // On the home page, intercept and smooth-scroll to the Hero instead of a hard nav.
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      aria-label="NEXATIXS — Inicio"
      className={cn("flex items-center gap-3", className)}
    >
      <span className="relative block h-11 w-11 shrink-0">
        <Image
          src="/assets/brand/logo/mark-transparent-light.png"
          alt=""
          fill
          sizes="44px"
          className="object-contain dark:hidden"
          priority
        />
        <Image
          src="/assets/brand/logo/mark-transparent.png"
          alt=""
          fill
          sizes="44px"
          className="hidden object-contain dark:block"
          priority
        />
      </span>
      <span className="font-heading text-xl font-bold tracking-tight text-foreground">
        NEXATIXS
      </span>
    </Link>
  );
}
