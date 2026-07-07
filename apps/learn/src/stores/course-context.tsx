"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { createLearnStore, type LearnState } from "@/stores/learn-store";
import type { Course } from "@/lib/course-data";
import { useStore } from "zustand";

interface CourseCtx {
  course: Course;
  store: ReturnType<typeof createLearnStore>;
}

const CourseContext = createContext<CourseCtx | null>(null);

export function CourseProvider({
  course,
  children,
}: {
  course: Course;
  children: ReactNode;
}) {
  const [store] = useState(() => createLearnStore(course.storeKey));
  return (
    <CourseContext.Provider value={{ course, store }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be inside <CourseProvider>");
  return ctx;
}

/** Select a slice of the Zustand store. Replaces direct `useStore(store, s => s.done)`. */
export function useCourseStore<T>(selector: (state: LearnState) => T): T {
  const { store } = useCourse();
  return useStore(store, selector);
}
