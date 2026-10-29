// Public surface of the HUD design system. Tokens and primitives live in
// separate modules so each can change independently; this barrel keeps
// `@/components/hud` as the single import path for app code.
export { T } from "./tokens";

export {
  GCEye,
  GCTick,
  GCChip,
  GCDash,
  GCDots,
  GCVDash,
  GCHair,
  GCKV,
  GCBar,
  GCStatus,
  GCScreenHeader,
  GCCard,
} from "./primitives";
