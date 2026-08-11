import type { ReactNode } from "react";
import "./globals.css";
import { fredoka } from "@/lib/fonts";

export const metadata = {
  title: "PawWalk Academy",
  description: "Interactive courses — build the PawWalk app step by step",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={fredoka.variable}>
      <body>{children}</body>
    </html>
  );
}
