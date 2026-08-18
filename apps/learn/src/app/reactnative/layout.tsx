import type { ReactNode } from 'react';

// Segment layout for the /reactnative practice app, folded in from the former
// apps/learn-reactnative workspace. The root layout owns <html>/<body>; this
// only mounts the Tailwind/shadcn-scoped `.rn-root` surface + section nav.
export default function LegacyReactNativeLayout({ children }: { children: ReactNode }) {
  return children;
}
