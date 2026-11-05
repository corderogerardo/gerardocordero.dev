import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { compareDecimal } from '@/lib/money';

import { trendColor, type Trend } from './theme';

export interface PriceChartPoint {
  p: string;
}

export interface PriceChartProps {
  points: readonly PriceChartPoint[];
  height?: number;
  trend?: Trend;
  accessibilityLabel?: string;
  testID?: string;
}

const INSET = 2;

function trendBetween(points: readonly PriceChartPoint[]): Trend {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return 'flat';

  const order = compareDecimal(last.p, first.p);
  if (order === null || order === 0) return 'flat';
  return order > 0 ? 'up' : 'down';
}

/**
 * Sparkline. Geometry uses numbers (pixels), never money arithmetic: prices are
 * only min/max-normalized for the path, and the sign of the move is decided with
 * the exact decimal comparator.
 */
export function PriceChart({
  points,
  height = 120,
  trend,
  accessibilityLabel,
  testID,
}: PriceChartProps) {
  const values = points
    .map((point) => Number(point.p))
    .filter((value) => Number.isFinite(value));

  const direction = trend ?? trendBetween(points);
  const stroke = trendColor(direction);

  const path = buildPath(values, height);
  const label =
    accessibilityLabel ??
    (values.length >= 2
      ? `Price chart, ${values.length} points, trending ${direction}`
      : 'Price chart, not enough data yet');

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
      style={[styles.container, { height }]}
      testID={testID}
    >
      {path ? (
        <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          <Path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </Svg>
      ) : (
        <View style={[styles.baseline, { backgroundColor: stroke }]} />
      )}
    </View>
  );
}

function buildPath(values: readonly number[], height: number): string | null {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const usableHeight = Math.max(height - INSET * 2, 1);
  const step = 100 / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * step;
      const ratio = span === 0 ? 0.5 : (value - min) / span;
      const y = INSET + (1 - ratio) * usableHeight;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
  baseline: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    opacity: 0.6,
  },
});
