import { education } from "@/src/data/education";
import { experiences } from "@/src/data/experience";
import { projects } from "@/src/data/projects";

import type { Doc } from "./types";

/**
 * Flatten the portfolio data into searchable documents. One doc per role /
 * project / education entry; `text` concatenates the fields worth matching on.
 */
export function buildCorpus(): Doc[] {
  const docs: Doc[] = [];

  experiences.forEach((e, i) => {
    docs.push({
      id: `exp-${i}`,
      kind: "experience",
      title: `${e.role} · ${e.company}`,
      meta: e.period,
      route: "/experience",
      text: [
        e.role,
        e.company,
        e.employmentType,
        e.location,
        e.description,
        ...e.highlights,
        ...e.skills,
        ...e.projects,
      ].join(". "),
    });
  });

  projects.forEach((p, i) => {
    docs.push({
      id: `proj-${i}`,
      kind: "project",
      title: p.name,
      meta: p.period,
      route: "/projects",
      text: [
        p.name,
        p.domain,
        p.tagline,
        ...(p.highlights ?? []),
        ...p.stack,
        ...p.platforms,
      ].join(". "),
    });
  });

  education.forEach((ed, i) => {
    docs.push({
      id: `edu-${i}`,
      kind: "education",
      title: `${ed.degree} · ${ed.institution}`,
      meta: ed.period,
      route: "/education",
      text: [ed.degree, ed.field ?? "", ed.institution, ed.location ?? "", ed.topics].join(
        ". ",
      ),
    });
  });

  return docs;
}
