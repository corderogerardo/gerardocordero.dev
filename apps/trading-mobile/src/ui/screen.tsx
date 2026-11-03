import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from './theme';

export interface ScreenProps {
  children: ReactNode;
  testID?: string;
  /** Wrap the content in a ScrollView. Lists keep their own virtualization. */
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

/**
 * Screen shell: the dark surface, the top safe-area inset, and one scroll
 * container. Every screen root carries a `screen-*` testID for Maestro.
 */
export function Screen({
  children,
  testID,
  scroll = false,
  contentContainerStyle,
  edges = ['top'],
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.root} edges={edges} testID={testID}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
