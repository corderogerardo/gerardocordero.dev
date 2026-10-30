// Static copy tables for the home ("status") screen.
//
// This lives outside app/ because Expo Router treats every file under app/ as a
// route, and these tables are plain content — no JSX, no screen state.

export const STACK = [
  "React",
  "React Native",
  "TypeScript",
  "Node.js",
  "Expo",
  "JavaScript",
];

export const INTERESTS = [
  { label: "AI", verb: "Explore" },
  { label: "Video Games", verb: "Play" },
  { label: "Data", verb: "Build" },
  { label: "Languages", verb: "Learn" },
];

export const YEARS: { label: string; value: number; unit: string }[] = [
  { label: "JS", value: 10, unit: "Y" },
  { label: "REACT / RN", value: 8, unit: "Y" },
  { label: "EXPRESS", value: 3, unit: "Y" },
  { label: "ANGULAR", value: 2, unit: "Y" },
];
