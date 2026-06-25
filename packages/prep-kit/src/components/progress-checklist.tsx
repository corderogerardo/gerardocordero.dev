"use client";

import type { ChecklistGroup } from "../types";
import { usePersisted } from "../config";

export function ProgressChecklist({ groups }: { groups: ChecklistGroup[] }) {
  const { value: checked, set: setChecked, reset } = usePersisted<
    Record<string, boolean>
  >("chk", {});

  const all = groups.flatMap((g) => g.items);
  const done = all.filter((i) => checked[i.id]).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="sticky top-[57px] z-10 -mx-4 bg-bg/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="h-3 overflow-hidden rounded-full border border-border bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm text-muted">
          <span>
            {done} of {all.length} complete · {pct}%
          </span>
          <button
            onClick={() => {
              if (confirm("Reset progress checklist?")) reset();
            }}
            className="font-medium transition-colors hover:text-bad"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-2 font-mono text-sm font-bold uppercase tracking-wide text-accent">
            {group.title}
          </h2>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface">
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={(e) =>
                      setChecked((c) => ({ ...c, [item.id]: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                  />
                  <span
                    className={
                      checked[item.id]
                        ? "text-muted line-through"
                        : "text-text"
                    }
                  >
                    {item.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
