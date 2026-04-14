export interface Experience {
  period: string;
  company: string;
  role: string;
  employmentType: string;
  location: string;
  description: string;
  highlights: string[];
  projects: string[];
  skills: string[];
  isCurrent?: boolean;
}

export const experiences: Experience[] = [
  {
    period: "May 2024 — Present",
    company: "Valt Network",
    role: "Sr. Mobile Engineer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Core mobile engineer on Valt Connect — a private-markets mobile experience for investors and deal teams. Team of 2 developers.",
    highlights: [
      "Google Sign-In + biometric auth (FaceID/TouchID) and App Store-compliant account deletion flow",
      "Real-time chat via Twilio Conversations — singleton provider, unread tracking, private flows, push notifications",
      "Salesforce auth via External Connected / External Managed Apps for secure token management",
      "Performance: eliminated re-render flickering, frozen screens, and added optimistic updates across profiles and bookmarks",
      "Unified Discover / Global Directory (groups, events, jobs, articles, opportunities) with consistent search and filters",
      "Built the full favorites / bookmarks system end-to-end — types, UI, tests — for opportunities and deals",
      "Report Abuse flows, internal notifications, version-based cache invalidation, organization management",
      "Managed production releases and App Store review responses",
    ],
    projects: ["Valt Connect"],
    skills: ["React Native", "TypeScript", "iOS", "Android", "Twilio", "Salesforce"],
    isCurrent: true,
  },
  {
    period: "Mar 2023 — Apr 2024",
    company: "TrueNorth",
    role: "Sr. Mobile Engineer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Exclusively dedicated to Valt Network via TrueNorth. Led the initial cross-platform iOS/Android release of Valt Connect.",
    highlights: [
      "Schema-driven Form Builder package from scratch — dynamic rendering, field validation, error handling — reused across apps in a Turborepo monorepo",
      "Deep linking via Firebase, then migrated to native universal / deep link handling for iOS & Android",
      "Real-time messaging with Twilio Conversations SDK — chat rooms, read tracking, unread badges, multi-user sessions",
      "Opportunities module end-to-end: listing, detail screens, multi-state access request workflows",
      "PSPDFKit integration for native PDF rendering of investor statements with custom toolbar and native patches",
      "End-to-end QR code scanning / sharing with custom iOS & Android camera permission hooks",
    ],
    projects: ["Valt Connect"],
    skills: ["React Native", "TypeScript", "Turborepo", "Monorepos", "Twilio"],
  },
  {
    period: "Mar 2021 — Oct 2022",
    company: "Novacomp",
    role: "Full Stack Developer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Shipped cross-platform mobile apps for US clients while ramping into AWS backend, taking on PM responsibilities, and mentoring.",
    highlights: [
      "Delivered frontend with focus on UX, accessibility, responsiveness, performance, and testing",
      "Five successful store releases — app IDs, profile credentials, notifications on Google Cloud and Apple Developer",
      "Learned AWS + Amplify on the job: SNS, Cognito, OAuth, AppSync, S3, Lambda, DynamoDB, Elasticsearch",
      "Acted as PM with clients on feature delivery, bug triage, and dev/design team coordination",
      "Recruiting interviews and mentorship for an entry-level developer on Git, React, and React Native",
    ],
    projects: [
      "SplashSpot",
      "Instatoolzz",
      "WeCurl",
      "Hotspotters",
      "NovaExpediente",
    ],
    skills: ["React Native", "AWS", "Amplify", "SQL", "Node.js"],
  },
  {
    period: "Apr 2019 — Nov 2020",
    company: "Bits Kingdom",
    role: "Full Stack Developer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Full-stack JavaScript across frontend, mobile, and backend — React, React Native, Express, Meteor — with hands-on performance tuning.",
    highlights: [
      "React patterns: Redux, Hooks, Reach Router, IndexedDB persistence, accessibility, lazy loading, memoization, SWR, React Query",
      "Express backend for Clinkky using Node 14/15 features and rate limiting",
      "Built Drivvo (Uber-like) with React Native, React Navigation, Google Maps, Geolocation, Redux, Flipper profiling",
      "Observed DX across React Native 0.59 → 0.60 → 0.62 and the Hermes Engine transition",
      "Also built browser extensions with React and Jest test suites",
    ],
    projects: [
      "Clinkky Admin",
      "Clinkky App",
      "StartUy",
      "Mamalingua",
      "Drivvo",
    ],
    skills: ["React", "React Native", "Express", "Meteor", "SQL", "NoSQL"],
  },
  {
    period: "Apr 2019 — Nov 2020",
    company: "Oino Tech",
    role: "Full Stack Developer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Same ownership as Bits Kingdom. Continued work on Mamalingua plus short-term outsourcing contributions.",
    highlights: [],
    projects: ["Mamalingua"],
    skills: ["React", "React Native", "SQL", "NoSQL"],
  },
  {
    period: "Jul 2018 — Apr 2019",
    company: "Solera Mobile",
    role: "Frontend Developer",
    employmentType: "Full-time",
    location: "Santiago de Surco, Lima, PE — On-site",
    description:
      "Angular frontend development for telecom and consumer-finance products. Built from scratch and maintained production apps.",
    highlights: [
      "Built Tuenti Freemium and Diners encuestas Backoffice from scratch",
      "Added new business logic to Tuenti.pe",
      "Maintained TarjetaOh Super Garantia post-release",
    ],
    projects: [
      "Tuenti Freemium",
      "Diners encuestas Backoffice",
      "TarjetaOh Super Garantia",
      "Tuenti.pe",
    ],
    skills: ["Angular", "TypeScript", "React Hooks"],
  },
  {
    period: "Mar 2018 — May 2018",
    company: "Bits Kingdom",
    role: "Full Stack Developer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Short initial sprint before the longer 2019-2020 engagement. MeteorJS + Angular full-stack with Twilio, Stripe, and Google Maps integrations.",
    highlights: [
      "Added Twilio number-buying flows from the web app via the Twilio API",
      "Distance / time tracking for location comparisons via Google Maps",
    ],
    projects: [
      "Roeku.eu WebApp",
      "SpotAt (Web + Hybrid Mobile)",
      "BDTicker WebApp",
    ],
    skills: ["MeteorJS", "Angular", "Node.js", "PostgreSQL"],
  },
  {
    period: "Jul 2017 — Nov 2017",
    company: "TUTEN",
    role: "Frontend Developer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Angular.js frontend work on a home-services product and its admin backoffice.",
    highlights: [
      "Added business logic to the Tuten web app and maintained the backoffice",
      "Refactored following John Papa and Todd Motto best practices",
      "Debugged Google Analytics + Angular.js integration issues",
    ],
    projects: ["Tuten Web Home Services", "Tuten Backoffice"],
    skills: ["AngularJS", "JavaScript"],
  },
  {
    period: "May 2017 — Jul 2017",
    company: "Variacode",
    role: "Full Stack Developer",
    employmentType: "Contract",
    location: "Remote",
    description:
      "Angular frontend plus test and automation infrastructure in Docker-managed environments.",
    highlights: [
      "Bitbucket Pipelines CI for unit, e2e, and TypeScript lint",
      "Scrapper pipeline evolution: CasperJS → Selenium / Firefox / Java in Docker for data and document extraction",
    ],
    projects: [
      "AdministraSimple (Landing + Angular app)",
      "Sii-API Scrapper",
    ],
    skills: ["Angular", "TypeScript", "Docker", "Selenium", "Java"],
  },
  {
    period: "Jul 2016 — Apr 2017",
    company: "EmployGate",
    role: "Full Stack Developer",
    employmentType: "Full-time",
    location: "Remote",
    description:
      "First long-term full-stack role. Frontend, backend, automation, documentation, and Linux SA on a MeteorJS stack.",
    highlights: [
      "MeteorJS stack: Blade templates, LESS, jQuery, MongoDB, NodeJS",
      "Automation bots with CasperJS / SlimerJS / Xvfb for stability over headless PhantomJS",
      "JSDoc + meteor-jsdoc for generated project documentation",
      "Linux SA: configured Nginx for MeteorJS on CentOS and Ubuntu",
    ],
    projects: ["TobMaps IP Reputation"],
    skills: ["Meteor.js", "MongoDB", "Node.js", "NoSQL", "Linux"],
  },
];
