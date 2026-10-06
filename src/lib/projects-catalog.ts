export interface ProjectEntry {
  slug: string;
  logo: string;
  link: string;
}

// Catálogo de proyectos propios para la página /proyectos y la vista previa en el home.
// El texto (título, descripción, etiquetas) vive en messages/{es,en}.json bajo Projects.items.<slug>.
// Para agregar un nuevo proyecto: 1) añade la entrada aquí, 2) añade su logo en public/assets/brand/,
// 3) añade el bloque de texto correspondiente en ambos archivos de idioma.
export const projects: ProjectEntry[] = [
  { slug: "kontao", logo: "/assets/brand/kontao/logo-icon.png", link: "https://www.kontao.lat/" },
  { slug: "mayfren", logo: "/assets/brand/mayfren/Logo-Mayfren.png", link: "https://mayfren.lat/" },
];
