import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ComingSoon({ title, body }: { title: string; body: string }) {
  const t = useTranslations("ComingSoon");

  return (
    <main className="flex flex-1 flex-col">
      <Section className="flex flex-1 items-center">
        <Container className="max-w-xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
            <Clock size={22} />
          </span>
          <span className="mt-4 block font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("badge")}
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-foreground/70">{body}</p>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-8")}>
            {t("backHome")}
          </Link>
        </Container>
      </Section>
    </main>
  );
}
