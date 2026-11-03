import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { colors, font, radius, space, weight } from "./tokens";

type FieldProps = TextInputProps & {
  label: string;
  testID: string;
};

/**
 * A labelled text input. The label is real text, not a placeholder: placeholders
 * vanish as soon as someone types, and a rep filling this in with one thumb does
 * not remember which box was which.
 */
export function Field({ label, testID, style, ...inputProps }: FieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: space[1] },
  label: {
    color: colors.textMuted,
    fontSize: font.caption,
    fontWeight: weight.medium,
    letterSpacing: 0.6,
  },
  input: {
    minHeight: 48,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: font.body,
    paddingHorizontal: space[3],
  },
});
