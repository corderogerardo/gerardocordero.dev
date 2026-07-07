"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePrepConfig } from "../config";
import { useI18n } from "../lib/i18n";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const { brand, nav } = usePrepConfig();
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const otherLocale = locale === "en" ? "es" : "en";
  const otherLabel = locale === "en" ? "ES" : "EN";
  const otherPath = pathname.replace(/^\/[^/]+/, `/${otherLocale}`);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-content items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight text-white"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-bg">
            {brand.logoText}
          </span>
          <span className="hidden sm:inline">{brand.title}</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={otherPath}
            className="ml-2 rounded-full border border-accent/40 bg-accent/12 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-bg"
            title={locale === "en" ? "Español" : "English"}
          >
            {otherLabel}
          </Link>
        </nav>

        <button
          type="button"
          aria-label={t("nav.toggle")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-border text-muted md:hidden"
        >
          <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/70 bg-bg/95 px-4 pb-3 md:hidden">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-accent/15 text-accent" : "text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={otherPath}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg border border-accent/40 bg-accent/12 px-3 py-2 text-center text-sm font-bold tracking-wide text-accent"
          >
            {locale === "en" ? "🌐 Español" : "🌐 English"}
          </Link>
        </nav>
      )}
    </header>
  );
}
