import Link from "next/link";
import type { CSSProperties } from "react";

interface SceneTile {
  emoji: string;
  hue: string;
}

export interface SceneTilesProps {
  tiles: SceneTile[];
}

export default function SceneTiles({ tiles }: SceneTilesProps) {
  return (
    <div className="hero-scene" aria-hidden="true">
      {tiles.map((t) => (
        <div
          key={t.emoji}
          className="scene-tile"
          style={{ "--tile-hue": t.hue } as CSSProperties}
        >
          {t.emoji}
        </div>
      ))}
    </div>
  );
}