export interface Certification {
  name: string;
  detail: string;
  logoSrc?: string;
}

export const partners: Certification[] = [
  { name: "Cisco", detail: "Ciberseguridad, CISCO PKT, Redes" },
  {
    name: "Google Cloud",
    detail: "Security Analyst / Cloud Threat Detection, Marketing Digital",
  },
  {
    name: "Kaspersky",
    detail: "Kaspersky Industrial CyberSecurity, KUMA Administration, KATA & EDR Administration",
  },
  {
    name: "Microsoft",
    detail: "Identity and Access Administrator Associate, Active Directory, Office 365",
  },
  { name: "Huawei", detail: "Certificación HCIA-2" },
];
