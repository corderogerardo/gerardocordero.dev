import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from './theme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  testID?: string;
}

/**
 * Labelled input with an inline error slot. The label is the accessibility
 * label; the error doubles as the hint so a screen reader announces it.
 */
export function TextField({
  label,
  value,
  onChangeText,
  error,
  hint,
  testID,
  editable = true,
  placeholderTextColor = colors.textMuted,
  ...inputProps
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        editable={editable}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, error ? styles.inputInvalid : null, !editable && styles.inputDisabled]}
        testID={testID}
        value={value}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    ...typography.body,
    minHeight: touchTarget,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  hint: {
    ...typography.caption,
  },
});
