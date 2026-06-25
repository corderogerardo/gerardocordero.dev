import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-bold uppercase",
  {
    variants: {
      tone: {
        accent: "border-accent/40 bg-accent/12 text-accent",
        good: "border-good/40 bg-good/12 text-good",
        warn: "border-warn/40 bg-warn/12 text-warn",
        bad: "border-bad/40 bg-bad/12 text-bad",
        muted: "border-border bg-surface-2 text-muted",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
