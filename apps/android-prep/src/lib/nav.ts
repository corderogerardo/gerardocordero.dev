export type NavItem = {
  href: string;
  label: string;
  /** Spanish nav label (falls back to `label`). */
  labelEs?: string;
  /** Short description used on the overview page cards. */
  blurb?: string;
  /** Spanish blurb (falls back to `blurb`). */
  blurbEs?: string;
};

export const NAV: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    labelEs: "Resumen",
    blurb: "Start here — how to use this guide.",
    blurbEs:
      "Empieza aquí — cómo usar esta guía.",
  },
  {
    href: "/today",
    label: "Today",
    labelEs: "Hoy",
    blurb: "Your daily drill: due cards + a coding & design prompt, with a streak.",
    blurbEs:
      "Tu práctica diaria: tarjetas pendientes + un ejercicio de código y diseño, con tu racha.",
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    labelEs: "Hoja de ruta",
    blurb: "Junior → mid → senior → architect. Know where you are, and what's next.",
    blurbEs:
      "Junior → mid → senior → arquitecto. Sabe dónde estás y qué sigue.",
  },
  {
    href: "/study",
    label: "Study Guide",
    labelEs: "Guía de estudio",
    blurb: "Every senior RN requirement, explained and tied to real experience.",
    blurbEs:
      "Cada requisito senior de RN, explicado y ligado a experiencia real.",
  },
  {
    href: "/architecture",
    label: "Architecture",
    labelEs: "Arquitectura",
    blurb: "Mobile system-design deep dives, from JSI to offline-first.",
    blurbEs:
      "Inmersiones de diseño de sistemas móviles, de JSI a offline-first.",
  },
  {
    href: "/pitches",
    label: "Pitches",
    labelEs: "Pitches",
    blurb: "Rehearsed intros and STAR stories you can deliver out loud.",
    blurbEs:
      "Presentaciones e historias STAR ensayadas para decir en voz alta.",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    labelEs: "Tarjetas",
    blurb: "Drill Q&A and grade yourself — progress saved in your browser.",
    blurbEs:
      "Practica preguntas y respuestas y califícate — tu progreso se guarda en el navegador.",
  },
  {
    href: "/quiz",
    label: "Quiz",
    labelEs: "Quiz",
    blurb: "Multiple-choice checks with instant, explained feedback.",
    blurbEs:
      "Preguntas de opción múltiple con retroalimentación instantánea y explicada.",
  },
  {
    href: "/practice",
    label: "Practice",
    labelEs: "Práctica",
    blurb: "Coding & system-design prompts — try first, then reveal the answer.",
    blurbEs:
      "Ejercicios de código y diseño de sistemas — inténtalo primero, luego revela la respuesta.",
  },
  {
    href: "/search",
    label: "Search",
    labelEs: "Buscar",
    blurb: "Find anything by keyword or meaning (on-device AI), and ask the AI tutor.",
    blurbEs:
      "Encuentra cualquier cosa por palabra clave o significado (IA en el dispositivo) y pregunta al tutor IA.",
  },
  {
    href: "/progress",
    label: "Progress",
    labelEs: "Progreso",
    blurb: "Tick off readiness milestones until every box is green.",
    blurbEs:
      "Marca los hitos de preparación hasta que todo esté en verde.",
  },
];

/** Primary tabs shown in the header (excludes the Overview/home link label tweak). */
export const PRIMARY_NAV = NAV;
