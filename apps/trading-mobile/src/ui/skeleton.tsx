import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from './theme';

export interface SkeletonProps {
  height?: number;
  width?: ViewStyle['width'];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Loading placeholder. Decorative on purpose: the surrounding container carries
 * `accessibilityRole="progressbar"` and one spoken label, so a screen reader
 * does not announce every block.
 */
export function Skeleton({ height = 16, width = '100%', style, testID }: SkeletonProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { height, width }, style]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
  },
});
