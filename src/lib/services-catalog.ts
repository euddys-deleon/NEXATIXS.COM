import { Cloud, Code2, LifeBuoy, Server, ShieldCheck, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServicePillar {
  slug: string;
  icon: LucideIcon;
}

export const servicePillars: ServicePillar[] = [
  { slug: "desarrollo", icon: Code2 },
  { slug: "infraestructura", icon: Server },
  { slug: "automatizacion", icon: Workflow },
  { slug: "cloud", icon: Cloud },
  { slug: "ciberseguridad", icon: ShieldCheck },
  { slug: "soporte", icon: LifeBuoy },
];

export function getServicePillar(slug: string) {
  return servicePillars.find((pillar) => pillar.slug === slug);
}
