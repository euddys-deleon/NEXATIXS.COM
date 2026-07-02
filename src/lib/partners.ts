export interface Certification {
  name: string;
  detail: string[];
  logoSrc?: string;
}

export const partners: Certification[] = [
  {
    name: "Cisco",
    detail: ["Ciberseguridad", "CISCO PKT", "Redes"],
  },
  {
    name: "Google Cloud",
    detail: ["Security Analyst, Cloud Threat Detection", "Marketing Digital"],
  },
  {
    name: "Kaspersky",
    detail: [
      "Certified Professional: Kaspersky Industrial CyberSecurity",
      "Certified Professional: KUMA Administration",
      "Certified Professional: KATA & EDR Administration",
    ],
  },
  {
    name: "Microsoft",
    detail: ["Identity and Access Administrator Associate", "Active Directory", "Office 365"],
  },
  {
    name: "Huawei",
    detail: ["Certificación Huawei HCIA-2"],
  },
  {
    name: "AWS",
    detail: ["Machine Learning Engineer", "Solutions Architect"],
  },
  {
    name: "Fortinet",
    detail: ["FCF (Fundamentos Certificados de Fortinet)"],
  },
];
