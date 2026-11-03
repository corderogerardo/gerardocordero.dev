import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, font, radius, space, weight } from "./tokens";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  tone?: "brand" | "quiet";
  testID?: string;
};

/**
 * The one button. It owns the pressed state, the busy state, and the disabled
 * state so no screen has to reinvent them (or forget the busy state, which is how
 * a double tap becomes two leads).
 */
export function Button({
  label,
  onPress,
  disabled = false,
  busy = false,
  tone = "brand",
  testID,
}: ButtonProps) {
  const inactive = disabled || busy;

  // The guard lives in the handler, not only in the prop. A `Pressable` with no
  // `onPress` still receives the touch on some platforms, and a busy button that
  // fires is how one tap becomes two leads.
  const handlePress = () => {
    if (inactive) return;
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        tone === "brand" ? styles.brand : styles.quiet,
        pressed && !inactive ? styles.pressed : null,
        inactive ? styles.inactive : null,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={tone === "brand" ? colors.textInverse : colors.text} />
      ) : (
        <Text style={[styles.label, tone === "brand" ? styles.labelBrand : styles.labelQuiet]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[4],
  },
  brand: { backgroundColor: colors.brand },
  quiet: { backgroundColor: colors.surfaceRaised },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.5 },
  label: { fontSize: font.body, fontWeight: weight.bold },
  labelBrand: { color: colors.textInverse },
  labelQuiet: { color: colors.text },
});
