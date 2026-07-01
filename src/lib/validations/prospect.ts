import { z } from "zod";

const acceptLegal = z
  .boolean()
  .refine((v) => v === true, { message: "required" });

export const f1Schema = z.object({
  razonSocial: z.string().min(1, "required"),
  rnc: z.string().min(1, "required"),
  sector: z.string().min(1, "required"),
  employeeCount: z.enum(["15-50", "51-200", "+200"]),
  contactName: z.string().min(1, "required"),
  contactRole: z.string().min(1, "required"),
  email: z.string().email("invalidEmail"),
  phone: z.string().min(1, "required"),
  currentInfra: z.string().min(1, "required"),
  mainObjective: z.string().min(1, "required"),
  timeline: z.enum(["inmediato", "1-3-meses", "mas-3-meses"]),
  acceptLegal,
});

export const f2Schema = z.object({
  businessName: z.string().min(1, "required"),
  requesterName: z.string().min(1, "required"),
  email: z.string().email("invalidEmail"),
  phone: z.string().min(1, "required"),
  businessActivity: z.string().min(1, "required"),
  helpArea: z.string().min(1, "required"),
  website: z.string().optional().or(z.literal("")),
  acceptLegal,
});

export const f3Schema = z.object({
  fullName: z.string().min(1, "required"),
  cedula: z.string().optional().or(z.literal("")),
  email: z.string().email("invalidEmail"),
  phone: z.string().min(1, "required"),
  occupation: z.string().min(1, "required"),
  reason: z.string().min(1, "required"),
  acceptLegal,
});

export type F1Values = z.infer<typeof f1Schema>;
export type F2Values = z.infer<typeof f2Schema>;
export type F3Values = z.infer<typeof f3Schema>;

export type FormType = "F1" | "F2" | "F3";

export type ProspectCategory =
  | "empresa_grande"
  | "empresa_mediana"
  | "empresa_pequena"
  | "organizacion_analisis_profundo"
  | "organizacion_consulta_rapida"
  | "persona_fisica";

export const categoryToFormType: Record<ProspectCategory, FormType> = {
  empresa_grande: "F1",
  empresa_mediana: "F1",
  empresa_pequena: "F2",
  organizacion_analisis_profundo: "F1",
  organizacion_consulta_rapida: "F2",
  persona_fisica: "F3",
};
