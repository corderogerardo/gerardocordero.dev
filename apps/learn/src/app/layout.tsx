import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "PawWalk Academy",
  description: "Interactive courses — build the PawWalk app step by step",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
