import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Course } from "@/lib/course-data";

const dataDir = join(process.cwd(), "public", "data");

const cache = new Map<string, Course>();

export function getCourseData(id: string, locale = "en"): Course {
  const cacheKey = `${locale}/${id}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  const filePath = join(dataDir, locale, `${id}.json`);
  if (!existsSync(filePath)) {
    const fallbackPath = join(dataDir, `${id}.json`);
    const data = JSON.parse(readFileSync(fallbackPath, "utf8")) as Course;
    cache.set(cacheKey, data);
    return data;
  }
  const data = JSON.parse(readFileSync(filePath, "utf8")) as Course;
  cache.set(cacheKey, data);
  return data;
}

export function getAllCourseIds(): string[] {
  const { readdirSync } = require("node:fs");
  return readdirSync(join(dataDir, "en"))
    .filter((f: string) => f.endsWith(".json"))
    .map((f: string) => f.replace(/\.json$/, ""));
}
