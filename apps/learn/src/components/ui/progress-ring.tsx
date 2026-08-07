// Presentational circular progress ring. Progress data is computed by the
// parent (CourseCard) — this component never touches localStorage itself.

interface ProgressRingProps {
  pct: number;
  /** HSL triple (e.g. `var(--course-ios-hsl)`) for the fill color. */
  hueHsl: string;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ pct, hueHsl, size = 46, strokeWidth = 4.5 }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * Math.max(0, Math.min(100, pct))) / 100;
  return (
    <svg
      className="progress-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${pct}%`}
    >
      <circle
        className="ring-track"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
      />
      <circle
        className="ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ stroke: `hsl(${hueHsl} / 1)` }}
      />
      <text className="ring-label" x="50%" y="50%" dominantBaseline="central" textAnchor="middle">
        {pct}%
      </text>
    </svg>
  );
}
