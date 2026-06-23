export type NavItem = {
  href: string;
  label: string;
  /** Short description used on the overview page cards. */
  blurb?: string;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Overview", blurb: "Start here — how to use this guide." },
  {
    href: "/today",
    label: "Today",
    blurb: "Your daily drill: due cards + a coding & design prompt, with a streak.",
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    blurb: "Junior → mid → senior → architect. Know where you are, and what's next.",
  },
  {
    href: "/study",
    label: "Study Guide",
    blurb: "Swift, SwiftUI, UIKit, concurrency, data, testing — explained from scratch.",
  },
  {
    href: "/architecture",
    label: "Architecture",
    blurb: "iOS system-design deep dives, from MVVM to modular multi-package apps.",
  },
  {
    href: "/pitches",
    label: "Pitches",
    blurb: "Spoken talk-tracks that explain key iOS topics clearly, out loud.",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    blurb: "Drill Q&A and grade yourself — progress saved in your browser.",
  },
  {
    href: "/quiz",
    label: "Quiz",
    blurb: "Multiple-choice checks with instant, explained feedback.",
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

/** Primary tabs shown in the header. */
export const PRIMARY_NAV = NAV;
