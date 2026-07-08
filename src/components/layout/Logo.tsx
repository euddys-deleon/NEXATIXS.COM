import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="NEXATIXS — Inicio"
      className={cn("flex items-center gap-2.5", className)}
    >
      <span className="relative block h-9 w-9 shrink-0">
        <Image
          src="/assets/brand/logo/mark-transparent-light.png"
          alt=""
          fill
          sizes="36px"
          className="object-contain dark:hidden"
          priority
        />
        <Image
          src="/assets/brand/logo/mark-transparent.png"
          alt=""
          fill
          sizes="36px"
          className="hidden object-contain dark:block"
          priority
        />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        NEXATIXS
      </span>
    </Link>
  );
}
