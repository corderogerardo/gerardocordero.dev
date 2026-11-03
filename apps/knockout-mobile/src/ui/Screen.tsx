import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, font, space, weight } from "./tokens";

type ScreenProps = {
  /** Shared with Maestro flows and unit tests. Convention: `screen-<name>`. */
  testID: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

/**
 * The shell every tab uses: safe area, a title block, and a scroll container.
 *
 * It exists so no screen has to remember the safe-area rules, and so the e2e
 * suite has one stable selector per tab (`screen-shift`, `screen-map`, …).
 */
export function Screen({ testID, title, subtitle, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        testID={testID}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: space[4], paddingBottom: space[7], gap: space[4] },
  header: { gap: space[1] },
  title: { color: colors.text, fontSize: font.display, fontWeight: weight.bold, letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: font.body, lineHeight: 21 },
});
