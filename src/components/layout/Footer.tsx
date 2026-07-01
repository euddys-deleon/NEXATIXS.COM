import Image from "next/image";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { leadershipTeam } from "@/lib/team";
import { InstagramIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

export function Footer() {
  const t = useTranslations("Footer");
  const tRoot = useTranslations();
  const teamRaw = tRoot.raw("Team") as { name: string; formation: string }[];

  return (
    <footer className="border-t border-foreground/10 bg-background-subtle">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/60">
              {t("description")}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/60 transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
              >
                <LinkedInIcon width={16} height={16} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/60 transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
              >
                <InstagramIcon width={16} height={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {t("contactTitle")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/70">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-blue" />
                <a href="mailto:soporte@nexatixs.com" className="hover:text-brand-blue">
                  soporte@nexatixs.com
                </a>
              </li>
              <li className="text-foreground/40">{t("phonePending")}</li>
            </ul>

            <h3 className="mt-8 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {t("legalTitle")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/70">
              <li>
                <Link href="/politica-de-privacidad" className="hover:text-brand-blue">
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/terminos-de-servicio" className="hover:text-brand-blue">
                  {t("termsOfService")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {t("leadershipTitle")}
            </h3>
            <ul className="mt-4 space-y-4">
              {leadershipTeam.map((member, index) => {
                const info = teamRaw[index];
                return (
                  <li key={info.name} className="flex items-center gap-3">
                    <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full border border-foreground/10">
                      <Image
                        src={member.photo}
                        alt={info.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{info.name}</p>
                      <p className="text-xs text-foreground/50">
                        {t("ceoTitle")} — {info.formation}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-foreground/10 pt-6 text-xs text-foreground/40">
          © {new Date().getFullYear()} NEXATIXS. {t("rightsReserved")}
        </div>
      </Container>
    </footer>
  );
}
