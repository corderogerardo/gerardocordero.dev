export type ProjectStatus = "live" | "shipped";

export interface Project {
  name: string;
  /** Industry / category, shown as the eyebrow. */
  domain: string;
  /** One-line description of what the app does. */
  tagline: string;
  period: string;
  status: ProjectStatus;
  /** Platforms the app ships on, e.g. ["iOS", "Android"]. */
  platforms: ("iOS" | "Android" | "Web")[];
  /** Public link (App Store / Google Play / web). Omit if private/NDA. */
  href?: string;
  /** Label for the link button, e.g. "App Store" | "Web". */
  linkLabel?: string;
  stack: string[];
  /** Standout bullets — shown only for the featured flagship. */
  highlights?: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: "Valt Connect",
    domain: "Private Markets",
    tagline:
      "Mobile experience for investors and deal teams to connect, transact, and manage in the private markets.",
    period: "2023 — 2026",
    status: "live",
    platforms: ["iOS", "Android"],
    href: "https://apps.apple.com/us/app/valt-connect/id6446118574",
    linkLabel: "App Store",
    stack: [
      "React Native",
      "TypeScript",
      "Twilio Conversations",
      "Salesforce Auth",
      "PSPDFKit",
      "Deep Linking",
      "Push",
    ],
    highlights: [
      "Real-time chat via Twilio Conversations — singleton provider, unread tracking, push notifications",
      "Biometric auth (FaceID/TouchID) + Salesforce External Connected Apps for secure token management",
      "PSPDFKit native module integration for in-app rendering of investor statements",
      "Performance: killed re-render flicker and frozen screens; optimistic updates across profiles & bookmarks",
      "Owned production releases and App Store review responses",
    ],
    featured: true,
  },
  {
    name: "Hotspotters",
    domain: "Consumer · Discovery",
    tagline: "Restaurant discovery plus a business-management back office.",
    period: "2022",
    status: "shipped",
    platforms: ["iOS"],
    href: "https://apps.apple.com/pe/app/hotspotters/id1604971409?l=en",
    linkLabel: "App Store",
    stack: ["React Native", "AWS Amplify", "In-App Purchases", "Push"],
  },
  {
    name: "SplashSpot",
    domain: "Consumer · Discovery",
    tagline: "Discover lakes and pools to visit with family.",
    period: "2021",
    status: "shipped",
    platforms: ["iOS"],
    href: "https://apps.apple.com/pe/app/splashspot/id1587025735?l=en",
    linkLabel: "App Store",
    stack: ["React Native", "AWS Amplify", "AppSync GraphQL", "Cognito", "S3"],
  },
  {
    name: "WeCurl",
    domain: "Consumer · Social",
    tagline: "Find training partners at nearby gyms.",
    period: "2021",
    status: "shipped",
    platforms: ["iOS"],
    href: "https://apps.apple.com/pe/app/wecurl/id1594195782?l=en",
    linkLabel: "App Store",
    stack: ["React Native", "AWS Amplify", "Geolocation"],
  },
  {
    name: "Instatoolzz",
    domain: "Marketplace",
    tagline: "Find and sell tools nearby.",
    period: "2021",
    status: "shipped",
    platforms: ["iOS"],
    href: "https://apps.apple.com/pe/app/insta-toolzz/id1593472888?l=en",
    linkLabel: "App Store",
    stack: ["React Native", "AWS Amplify", "Push"],
  },
  {
    name: "Clinkky",
    domain: "Financial Education",
    tagline:
      "Financial-education app for kids with a parent back office — built the back office and the Node API.",
    period: "2019 — 2020",
    status: "shipped",
    platforms: ["Web", "iOS"],
    href: "https://admin.clinkky.com/",
    linkLabel: "Web",
    stack: ["React", "Redux", "Express", "Node.js", "SWR", "IndexedDB"],
  },
  {
    name: "gerardocordero.dev",
    domain: "Personal",
    tagline:
      "This portfolio — an editorial, native HUD built with Expo Router on a Turborepo monorepo.",
    period: "2026",
    status: "live",
    platforms: ["iOS", "Android", "Web"],
    href: "https://gerardocordero.dev/",
    linkLabel: "Web",
    stack: ["Expo Router", "NativeWind v5", "Turborepo", "TypeScript"],
  },
  {
    name: "React Native Interview Prep",
    domain: "Interview Prep",
    tagline:
      "A senior React Native engineer study guide — mobile-architecture notes, practice pitches, and Q&A flashcards with a progress tracker.",
    period: "2026",
    status: "live",
    platforms: ["Web"],
    href: "https://reactnative.gerardocordero.dev/",
    linkLabel: "Web",
    stack: ["Expo Router", "React Native Web", "TypeScript"],
  },
  {
    name: "iOS Interview Prep",
    domain: "Interview Prep",
    tagline:
      "A senior iOS engineer study guide — Swift & SwiftUI deep-dives, practice pitches, and Q&A flashcards with a progress tracker.",
    period: "2026",
    status: "live",
    platforms: ["Web"],
    href: "https://ios.gerardocordero.dev/",
    linkLabel: "Web",
    stack: ["Swift", "SwiftUI", "UIKit"],
  },
  {
    name: "Android Interview Prep",
    domain: "Interview Prep",
    tagline:
      "A senior Android engineer study guide — Kotlin & Jetpack Compose deep-dives, coding sessions, and Q&A flashcards with a progress tracker.",
    period: "2026",
    status: "live",
    platforms: ["Web"],
    href: "https://android.gerardocordero.dev/",
    linkLabel: "Web",
    stack: ["Kotlin", "Jetpack Compose", "Coroutines"],
  },
  {
    name: "NestJS Interview Prep",
    domain: "Interview Prep",
    tagline:
      "A senior NestJS / Node backend study guide — request-lifecycle and DI deep-dives, microservices and security, plus coding & system-design prompts with Q&A flashcards.",
    period: "2026",
    status: "live",
    platforms: ["Web"],
    href: "https://nestjs.gerardocordero.dev/",
    linkLabel: "Web",
    stack: ["NestJS", "TypeScript", "Node.js"],
  },
];
