import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface SceneTile {
  label: string;
  href: string;
  Icon: LucideIcon;
  hue: string;
}

export interface SceneTilesProps {
  tiles: SceneTile[];
  /** Localized CTA string passed down by the i18n-aware parent. */
  exploreLabel?: string;
}

export default function SceneTiles({ tiles, exploreLabel = "Explore course" }: SceneTilesProps) {
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
