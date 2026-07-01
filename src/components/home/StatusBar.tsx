"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function StatusBar() {
  const t = useTranslations("Estatus.homeBar");
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    router.push(`/consulta-estatus?id=${encodeURIComponent(value.trim())}`);
  }

  return (
    <section className="border-y border-foreground/10 bg-background-subtle">
      <Container className="flex flex-col items-center gap-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-foreground/60">{t("subtitle")}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-3">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("title")}
          />
          <Button type="submit">{t("cta")}</Button>
        </form>
      </Container>
    </section>
  );
}
