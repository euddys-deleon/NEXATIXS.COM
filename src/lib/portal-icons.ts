import { Boxes, Cloud, Package, ShieldCheck, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getCategoryIcon(category?: string | null): LucideIcon {
  switch (category) {
    case "ERP":
      return Boxes;
    case "Infraestructura":
    case "Cloud":
      return Cloud;
    case "Ciberseguridad":
      return ShieldCheck;
    case "Automatización":
      return Workflow;
    default:
      return Package;
  }
}
