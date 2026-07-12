export interface Certification {
  name: string;
  detail: string[];
  logoSrc?: string;
}

export const partners: Certification[] = [
  {
    name: "Cisco",
    detail: ["Ciberseguridad", "CISCO PKT", "Redes"],
    logoSrc: "/assets/certifications/cisco-mono.png",
  },
  {
    name: "Google Cloud",
    detail: ["Security Analyst, Cloud Threat Detection", "Marketing Digital"],
    logoSrc: "/assets/certifications/google-cloud-mono.png",
  },
  {
    name: "Kaspersky",
    detail: [
      "Certified Professional: Kaspersky Industrial CyberSecurity",
      "Certified Professional: KUMA Administration",
      "Certified Professional: KATA & EDR Administration",
    ],
    logoSrc: "/assets/certifications/kaspersky-mono.png",
  },
  {
    name: "Microsoft",
    detail: ["Identity and Access Administrator Associate", "Active Directory", "Office 365"],
    logoSrc: "/assets/certifications/microsoft-mono.png",
  },
  {
    name: "Huawei",
    detail: ["Certificación Huawei HCIA-2"],
    logoSrc: "/assets/certifications/huawei-mono.png",
  },
  {
    name: "AWS",
    detail: ["Machine Learning Engineer", "Solutions Architect"],
    logoSrc: "/assets/certifications/aws-mono.png",
  },
  {
    name: "Fortinet",
    detail: ["FCF (Fundamentos Certificados de Fortinet)"],
    logoSrc: "/assets/certifications/fortinet-mono.png",
  },
];
