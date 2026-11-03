import { Platform, type TextStyle } from 'react-native';

/**
 * Design tokens for the trading app.
 *
 * Direction: a dark, dense trading terminal. Flat surfaces separated by hairline
 * borders instead of shadows, one accent colour, and colour reserved for
 * meaning (up/down/action) rather than decoration. Numbers are the hero, so they
 * use tabular figures and a monospaced face.
 */

export const colors = {
  background: '#0B0E11',
  surface: '#131A22',
  surfaceElevated: '#1B242E',
  border: '#24303C',
  borderStrong: '#33414F',
  text: '#E7EDF3',
  textMuted: '#8A99A8',
  textInverse: '#08110C',
  accent: '#4DA3FF',
  accentPressed: '#2F86E0',
  up: '#2ED47A',
  upSoft: 'rgba(46, 212, 122, 0.14)',
  down: '#FF5C5C',
  downSoft: 'rgba(255, 92, 92, 0.14)',
  warning: '#FFB020',
  danger: '#FF5C5C',
  overlay: 'rgba(4, 6, 8, 0.72)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12,
  label: 13,
  body: 16,
  title: 20,
  headline: 26,
  display: 34,
} as const;

export const touchTarget = 44;

const numberFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/** Tabular figures keep prices from jittering as digits change. */
export const numeric: TextStyle = {
  fontFamily: numberFont,
  fontVariant: ['tabular-nums'],
};

export const hairline: TextStyle = {
  borderWidth: Platform.select({ ios: 0.5, default: 1 }),
};

export const typography = {
  display: {
    fontSize: fontSize.display,
    lineHeight: 38,
    fontWeight: '700',
    color: colors.text,
  },
  headline: {
    fontSize: fontSize.headline,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: fontSize.title,
    lineHeight: 26,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: fontSize.body,
    lineHeight: 22,
    color: colors.text,
  },
  label: {
    fontSize: fontSize.label,
    lineHeight: 18,
    color: colors.textMuted,
  },
  caption: {
    fontSize: fontSize.caption,
    lineHeight: 16,
    color: colors.textMuted,
  },
} as const;

export type Trend = 'up' | 'down' | 'flat';

export function trendColor(trend: Trend): string {
  if (trend === 'up') return colors.up;
  if (trend === 'down') return colors.down;
  return colors.textMuted;
}

export function trendBackground(trend: Trend): string {
  if (trend === 'up') return colors.upSoft;
  if (trend === 'down') return colors.downSoft;
  return colors.surfaceElevated;
}

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  typography,
  numeric,
  touchTarget,
  trendColor,
  trendBackground,
} as const;

export type Theme = typeof theme;
