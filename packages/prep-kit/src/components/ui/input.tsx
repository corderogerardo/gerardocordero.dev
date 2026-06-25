import * as React from "react";
import { cn } from "../../lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-accent/60",
          className,
        )}
        {...props}
      />
    );
  },
);
