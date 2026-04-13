export interface Experience {
  period: string;
  company: string;
  role: string;
  description: string;
  projects: string;
}

export const experiences: Experience[] = [
  {
    period: "2023 - Now",
    company: "TrueNorth.co",
    role: "Sr. Mobile Developer",
    description: "Working in React Native.",
    projects: "WIP",
  },
  {
    period: "2021 - 2022",
    company: "NovaComp",
    role: "Consultor Senior",
    description: "Working in React Native Apps for US Clients.",
    projects: "SplashSpot, Instatoolz, WeCurl, Hotspotter",
  },
  {
    period: "2018 - 2020",
    company: "Bits Kingdom",
    role: "Full Stack",
    description: "Working with JavaScript in frontend and backend.",
    projects: "Clinkky, StartUY, Mamalingua",
  },
  {
    period: "2018 - 2019",
    company: "Solera Mobile",
    role: "Frontend Developer",
    description: "Working with React and React Native.",
    projects: "Tuenti Freemium, Dinners backoffice",
  },
];
