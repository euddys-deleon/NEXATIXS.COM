export interface Certification {
  name: string;
  detail: string[];
  logoSrc?: string;
  fillTile?: boolean;
}

export const partners: Certification[] = [
  {
    name: "Cisco",
    detail: ["Ciberseguridad", "CISCO PKT", "Redes"],
    logoSrc: "/assets/certifications/cisco.jpg",
  },
  {
    name: "Google Cloud",
    detail: ["Security Analyst, Cloud Threat Detection", "Marketing Digital"],
    logoSrc: "/assets/certifications/google-cloud.png",
  },
  {
    name: "Kaspersky",
    detail: [
      "Certified Professional: Kaspersky Industrial CyberSecurity",
      "Certified Professional: KUMA Administration",
      "Certified Professional: KATA & EDR Administration",
    ],
    logoSrc: "/assets/certifications/kaspersky.png",
    fillTile: true,
  },
  {
    name: "Microsoft",
    detail: ["Identity and Access Administrator Associate", "Active Directory", "Office 365"],
    logoSrc: "/assets/certifications/microsoft.png",
  },
  {
    name: "Huawei",
    detail: ["Certificación Huawei HCIA-2"],
    logoSrc: "/assets/certifications/huawei.jpeg",
  },
  {
    name: "AWS",
    detail: ["Machine Learning Engineer", "Solutions Architect"],
    logoSrc: "/assets/certifications/aws.png",
  },
  {
    name: "Fortinet",
    detail: ["FCF (Fundamentos Certificados de Fortinet)"],
  },
];
