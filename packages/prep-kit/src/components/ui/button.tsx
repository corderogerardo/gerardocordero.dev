import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

// shadcn-style Button. Variants encode this design system's existing button
// looks (the bespoke CSS-variable theme), so adopting it is visually lossless.
export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "rounded-xl bg-gradient-to-r from-accent to-accent-2 font-bold text-bg hover:opacity-90",
        ghost:
          "rounded-lg border border-border bg-surface text-muted hover:border-accent/50 hover:text-text",
        good: "rounded-lg bg-good/15 font-bold text-good hover:bg-good/25",
        warn: "rounded-lg bg-warn/15 font-bold text-warn hover:bg-warn/25",
        bad: "rounded-lg bg-bad/15 font-bold text-bad hover:bg-bad/25",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
      },
    },
    defaultVariants: { variant: "ghost", size: "sm" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
