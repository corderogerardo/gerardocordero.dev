import type { ReactNode } from "react";

export default function PracticeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="practice-root min-h-svh bg-background text-foreground">
      {children}
    </div>
  );
}
