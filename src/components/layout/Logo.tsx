"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(root.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
      className={cn("flex items-center gap-2.5", className)}
    >
      <span className="relative block h-16 w-16 shrink-0">
        {/* Inline `style` opacity is used deliberately (not Tailwind opacity-* utilities):
            it always wins the cascade, avoiding a layer/specificity conflict we hit
            with the utility classes where the visible logo did not track theme state. */}
        <Image
          src="/assets/brand/logo/mark-transparent-light.png"
          alt=""
          fill
          sizes="64px"
          className="object-contain"
          style={{ opacity: isDark ? 0 : 1, transition: "opacity 300ms ease-in-out" }}
          priority
        />
        <Image
          src="/assets/brand/logo/mark-transparent.png"
          alt=""
          fill
          sizes="64px"
          className="object-contain"
          style={{ opacity: isDark ? 1 : 0, transition: "opacity 300ms ease-in-out" }}
          priority
        />
      </span>
      <span className="font-heading text-3xl font-bold leading-none tracking-tight text-foreground">
        NEXATIXS
      </span>
    </Link>
  );
}
