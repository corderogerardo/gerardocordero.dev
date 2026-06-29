import type { NavItem } from "@gerardocordero/prep-kit";

// The routes this app ships. Add/remove entries here; the header, mobile
// menu, and overview cards all read from this list.
export const NAV: NavItem[] = [
  { href: "/", label: "Overview", blurb: "Start here — how to use this guide." },
  {
    href: "/today",
    label: "Today",
    blurb: "Your daily drill: due cards + a coding & design prompt, with a streak.",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    blurb: "Drill NestJS Q&A and grade yourself — progress saved in your browser.",
  },
  {
    href: "/quiz",
    label: "Quiz",
    blurb: "Multiple-choice checks on lifecycle, DI, and security — explained feedback.",
  },
  {
    href: "/practice",
    label: "Practice",
    blurb: "Coding & system-design prompts — try first, then reveal the answer.",
  },
  {
    href: "/search",
    label: "Search",
    blurb: "Find anything by keyword or meaning (on-device AI), and ask the AI tutor.",
  },
  {
    href: "/progress",
    label: "Progress",
    blurb: "Tick off readiness milestones until every box is green.",
  },
];

export const PRIMARY_NAV = NAV;
