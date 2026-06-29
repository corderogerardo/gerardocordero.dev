export type EducationStatus = "completed" | "left" | "in-progress";
export type EducationKind = "formal" | "course";

export interface Education {
  period: string;
  institution: string;
  location?: string;
  degree: string;
  field?: string;
  topics: string;
  status: EducationStatus;
  kind: EducationKind;
}

export const education: Education[] = [
  {
    period: "2006 — 2009",
    institution: "IUT Antonio Jose de Sucre",
    location: "Barquisimeto, Venezuela",
    degree: "Associate's Degree",
    field: "Computer Science",
    topics: "POO, UML, SQL, C++, Networks, NoSQL",
    status: "completed",
    kind: "formal",
  },
  {
    period: "2012",
    institution: "Universidad Centro Occidental 'Lisandro Alvarado'",
    location: "Venezuela",
    degree: "Computer Software Engineering",
    field: "Coursework — did not graduate",
    topics: "",
    status: "left",
    kind: "formal",
  },
  {
    period: "2020",
    institution: "Zero To Mastery Academy",
    degree: "JavaScript Engineer",
    field: "Computer Software Engineering",
    topics: "React.js, Node.js",
    status: "completed",
    kind: "course",
  },
  {
    period: "2020 — 2021",
    institution: "Zero To Mastery Academy",
    degree: "React",
    field: "Computer Software Engineering",
    topics: "React.js, Node.js",
    status: "completed",
    kind: "course",
  },
  {
    period: "2021",
    institution: "Platzi",
    degree: "React Native",
    field: "Computer Software Engineering",
    topics: "React Native, React.js, Node.js",
    status: "completed",
    kind: "course",
  },
  {
    period: "2021",
    institution: "Platzi",
    degree: "Carrera de JavaScript",
    field: "Computer Software Engineering",
    topics: "JavaScript, Node.js, React Hooks",
    status: "completed",
    kind: "course",
  },
];
