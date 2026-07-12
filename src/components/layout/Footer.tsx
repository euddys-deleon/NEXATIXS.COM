import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { leadershipTeam } from "@/lib/team";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/icons/SocialIcons";

const SOCIAL_LINKS = [
  { icon: LinkedInIcon, label: "LinkedIn", href: "https://www.linkedin.com/company/nexatixs/" },
  { icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/nexatixs/" },
  {
    icon: FacebookIcon,
    label: "Facebook",
    href: "https://www.facebook.com/share/1NpzQ9JZWz/?mibxtid=wwXlfr",
  },
  {
    icon: TikTokIcon,
    label: "TikTok",
    href: "https://www.tiktok.com/@nexatixs?_r=1&_t=ZS-97xWXi0l0SO",
  },
  { icon: WhatsAppIcon, label: "WhatsApp", href: "https://wa.me/18292680004" },
];

export function Footer() {
  const t = useTranslations("Footer");
  const tRoot = useTranslations();
  const teamRaw = tRoot.raw("Team") as {
    name: string;
    title: string;
    role: string;
    formation: string;
  }[];

  return (
    <footer className="border-t border-foreground/10 bg-background-subtle">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/60">
              {t("description")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/60 transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
                >
                  <social.icon width={16} height={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
              {t("contactTitle")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/70">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-blue" />
                <a href="mailto:soporte@nexatixs.com" className="hover:text-brand-blue">
                  soporte@nexatixs.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-blue" />
                <a href="mailto:info@nexatixs.com" className="hover:text-brand-blue">
                  info@nexatixs.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-brand-blue" />
                <a href="tel:+18292680004" className="hover:text-brand-blue">
                  (829) 268-0004
                </a>
              </li>
            </ul>

            <h3 className="mt-8 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
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
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
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
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{info.name}</p>
                      <p className="text-xs font-medium text-sky-400">{info.title}</p>
                      <p className="text-xs text-foreground/60">{info.role}</p>
                    </div>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn — ${info.name}`}
                        className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-foreground/10 text-foreground/60 transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
                      >
                        <LinkedInIcon width={14} height={14} />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-foreground/10 pt-6 text-xs text-foreground/60">
          © {new Date().getFullYear()} NEXATIXS. {t("rightsReserved")}
        </div>
      </Container>
    </footer>
  );
}
