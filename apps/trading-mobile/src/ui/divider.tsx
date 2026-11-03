import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, hairline, spacing } from './theme';

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    ...hairline,
    borderColor: colors.border,
    marginVertical: spacing.md,
  },
});
