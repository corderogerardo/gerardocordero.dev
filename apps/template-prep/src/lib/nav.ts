import type { NavItem } from "@gerardocordero/prep-kit";

// The routes this template ships. Add/remove entries here; the header, mobile
// menu, and overview cards all read from this list. `labelEs`/`blurbEs` power
// the /es locale — drop them if your site is single-language.
export const NAV: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    labelEs: "Resumen",
    blurb: "Start here — how to use this template.",
    blurbEs: "Empieza aquí — cómo usar esta plantilla.",
  },
  {
    href: "/today",
    label: "Today",
    labelEs: "Hoy",
    blurb: "Your daily drill: due cards + a coding & design prompt, with a streak.",
    blurbEs: "Tu práctica diaria: tarjetas pendientes + un ejercicio de código y diseño, con tu racha.",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    labelEs: "Tarjetas",
    blurb: "Drill Q&A and grade yourself — progress saved in your browser.",
    blurbEs: "Practica preguntas y respuestas y califícate — tu progreso se guarda en el navegador.",
  },
  {
    href: "/quiz",
    label: "Quiz",
    labelEs: "Quiz",
    blurb: "Multiple-choice checks with instant, explained feedback.",
    blurbEs: "Preguntas de opción múltiple con retroalimentación instantánea y explicada.",
  },
  {
    href: "/practice",
    label: "Practice",
    labelEs: "Práctica",
    blurb: "Coding & system-design prompts — try first, then reveal the answer.",
    blurbEs: "Ejercicios de código y diseño de sistemas — inténtalo primero, luego revela la respuesta.",
  },
  {
    href: "/search",
    label: "Search",
    labelEs: "Buscar",
    blurb: "Find anything by keyword or meaning (on-device AI), and ask the AI tutor.",
    blurbEs: "Encuentra cualquier cosa por palabra clave o significado (IA en el dispositivo) y pregunta al tutor IA.",
  },
  {
    href: "/progress",
    label: "Progress",
    labelEs: "Progreso",
    blurb: "Tick off readiness milestones until every box is green.",
    blurbEs: "Marca los hitos de preparación hasta que todo esté en verde.",
  },
];

export const PRIMARY_NAV = NAV;
