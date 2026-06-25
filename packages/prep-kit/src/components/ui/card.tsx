import * as React from "react";
import { cn } from "../../lib/cn";

// Thin shadcn-style wrapper over the design system's `.card` utility (defined in
// each app's globals.css), so new UI can compose <Card> instead of re-typing the
// class. Forwards a ref for completeness.
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...props }, ref) {
    return <div ref={ref} className={cn("card", className)} {...props} />;
  },
);
