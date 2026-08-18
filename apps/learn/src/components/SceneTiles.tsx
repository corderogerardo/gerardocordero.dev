import Link from "next/link";
import { Bot, Braces, Gem, Smartphone, Terminal } from "lucide-react";

interface SceneTile {
  emoji: string;
  hue: string;
}

export interface SceneTilesProps {
  tiles: SceneTile[];
}

const scenes = [
  { label: "iOS & Swift", href: "/en/learn/ios", Icon: Smartphone },
  { label: "Android & Kotlin", href: "/en/learn/android", Icon: Bot },
  { label: "Ruby & Rails", href: "/en/learn/ruby", Icon: Gem },
  { label: "Python & FastAPI", href: "/en/learn/python", Icon: Braces },
  { label: "Go Backend", href: "/en/learn/go", Icon: Terminal },
];

export default function SceneTiles({ tiles }: SceneTilesProps) {
  return (
    <div className="mt-8" aria-label="Featured courses">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((tile, index) => {
          const scene = scenes[index] ?? scenes[0];
          const Icon = scene.Icon;
          return (
          <Link
            key={scene.href}
            href={scene.href}
            className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-5 w-5" /></span>
            <span className="mt-4 block text-sm font-semibold tracking-tight">{scene.label}</span>
            <span className="mt-1 block text-xs text-muted-foreground">Explore course</span>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
