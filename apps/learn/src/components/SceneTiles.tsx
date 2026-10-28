import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Braces, Bot, Gem, Smartphone, Terminal } from "lucide-react";

export interface SceneTile {
  label: string;
  href: string;
  Icon: LucideIcon;
  hue: string;
}

/**
 * Canonical scene tile catalog — one source of truth for label/href/Icon/hue.
 * Callers supply a locale only; they never assemble tiles or pair by index,
 * so there is no `Icon: undefined` risk from mismatched indices.
 */
export const SCENE_TILE_CATALOG: SceneTile[] = [
  { label: "iOS & Swift", href: "/en/learn/ios", Icon: Smartphone, hue: "var(--course-ios-hsl)" },
  { label: "Android & Kotlin", href: "/en/learn/android", Icon: Bot, hue: "var(--course-android-hsl)" },
  { label: "Ruby & Rails", href: "/en/learn/ruby", Icon: Gem, hue: "var(--course-ruby-hsl)" },
  { label: "Python & FastAPI", href: "/en/learn/python", Icon: Braces, hue: "var(--course-python-hsl)" },
  { label: "Go Backend", href: "/en/learn/go", Icon: Terminal, hue: "var(--course-go-hsl)" },
];

/**
 * Resolve the canonical tile catalog for a locale. Labels currently ship in
 * English source text; localized label bundles can be wired here per locale
 * without touching callers.
 */
export function getSceneTiles(_locale: string): SceneTile[] {
  return SCENE_TILE_CATALOG;
}

export interface SceneTilesProps {
  locale: string;
  /** Localized CTA string passed down by the i18n-aware parent. */
  exploreLabel?: string;
}

export default function SceneTiles({ locale, exploreLabel = "Explore course" }: SceneTilesProps) {
  const tiles = getSceneTiles(locale);
  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((tile) => {
          const Icon = tile.Icon;
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {/* tile.hue is a CSS var reference (e.g. var(--course-ios-hsl)),
                  so the tint follows light/dark automatically. */}
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                style={{ backgroundColor: `hsl(${tile.hue} / 0.12)`, color: `hsl(${tile.hue})` }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 block text-sm font-semibold tracking-tight">{tile.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{exploreLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
