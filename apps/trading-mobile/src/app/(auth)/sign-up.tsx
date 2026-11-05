import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { describeApiError, isApiError } from '@/api/errors';
import { copy } from '@/config';
import {
  PASSWORD_MIN_LENGTH,
  hasAuthErrors,
  validateSignUpForm,
  type AuthFieldErrors,
} from '@/lib/auth-validation';
import { useSession } from '@/session/store';
import { Badge, Button, Card, Screen, TextField, colors, spacing, typography } from '@/ui';

export default function SignUpScreen() {
  const signUp = useSession((state) => state.signUp);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    const validation = validateSignUpForm({ email, password, displayName });
    setErrors(validation);
    setFormError(null);
    if (hasAuthErrors(validation)) return;

    setPending(true);
    try {
      await signUp({ email, password, displayName });
      // The root layout's guard moves to the tabs once the session lands.
    } catch (error) {
      const message = describeApiError(error, 'signUp');
      const field = isApiError(error) ? error.field : undefined;

      if (field === 'email' || field === 'password' || field === 'displayName') {
        setErrors({ [field]: message });
      } else {
        setFormError(message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen scroll edges={['top', 'bottom']} testID="screen-sign-up">
      <View style={styles.brand}>
        <Text style={styles.wordmark}>Meridian</Text>
        <Badge label="PAPER" tone="warning" />
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        Create account
      </Text>
      <Text style={styles.subtitle}>
        You start with simulated cash. Prices come from a deterministic paper market.
      </Text>

      <Card style={styles.card}>
        <TextField
          autoCapitalize="words"
          autoComplete="name"
          error={errors.displayName}
          label="Display name"
          onChangeText={setDisplayName}
          placeholder="Ada Lovelace"
          returnKeyType="next"
          testID="sign-up-display-name"
          textContentType="name"
          value={displayName}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="trader@example.com"
          returnKeyType="next"
          testID="sign-up-email"
          textContentType="emailAddress"
          value={email}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.password}
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          label="Password"
          onChangeText={setPassword}
          onSubmitEditing={() => void submit()}
          placeholder="Choose a password"
          returnKeyType="go"
          secureTextEntry
          testID="sign-up-password"
          textContentType="newPassword"
          value={password}
        />

        {formError ? (
          <Text accessibilityLiveRegion="polite" style={styles.formError} testID="sign-up-error">
            {formError}
          </Text>
        ) : null}

        <Button
          disabled={pending}
          label="Create account"
          loading={pending}
          onPress={() => void submit()}
          testID="sign-up-submit"
        />
      </Card>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.replace('/(auth)/sign-in')}
        style={styles.linkRow}
        testID="sign-up-to-sign-in"
      >
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>

      <Text style={styles.disclaimer}>{copy.disclaimer}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  wordmark: {
    ...typography.headline,
    color: colors.text,
    letterSpacing: 1,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.xl,
  },
  subtitle: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  formError: {
    ...typography.label,
    color: colors.danger,
  },
  linkRow: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  link: {
    ...typography.label,
    color: colors.accent,
    fontWeight: '600',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
