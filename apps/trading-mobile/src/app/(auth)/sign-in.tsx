import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { describeApiError, isApiError } from '@/api/errors';
import { copy } from '@/config';
import {
  hasAuthErrors,
  validateSignInForm,
  type AuthFieldErrors,
} from '@/lib/auth-validation';
import { useSession } from '@/session/store';
import { Badge, Button, Card, Screen, TextField, colors, spacing, typography } from '@/ui';

export default function SignInScreen() {
  const signIn = useSession((state) => state.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    const validation = validateSignInForm({ email, password });
    setErrors(validation);
    setFormError(null);
    if (hasAuthErrors(validation)) return;

    setPending(true);
    try {
      await signIn({ email, password });
      // The root layout's guard moves to the tabs once the session lands.
    } catch (error) {
      const message = describeApiError(error, 'signIn');
      const field = isApiError(error) ? error.field : undefined;

      if (field === 'email' || field === 'password') {
        setErrors({ [field]: message });
      } else {
        setFormError(message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen scroll edges={['top', 'bottom']} testID="screen-sign-in">
      <View style={styles.brand}>
        <Text style={styles.wordmark}>Meridian</Text>
        <Badge label="PAPER" tone="warning" />
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        Sign in
      </Text>
      <Text style={styles.subtitle}>
        Paper trading with simulated prices. No real money and no real orders.
      </Text>

      <Card style={styles.card}>
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
          testID="sign-in-email"
          textContentType="emailAddress"
          value={email}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          onChangeText={setPassword}
          onSubmitEditing={() => void submit()}
          placeholder="Your password"
          returnKeyType="go"
          secureTextEntry
          testID="sign-in-password"
          textContentType="password"
          value={password}
        />

        {formError ? (
          <Text accessibilityLiveRegion="polite" style={styles.formError} testID="sign-in-error">
            {formError}
          </Text>
        ) : null}

        <Button
          disabled={pending}
          label="Sign in"
          loading={pending}
          onPress={() => void submit()}
          testID="sign-in-submit"
        />
      </Card>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.replace('/(auth)/sign-up')}
        style={styles.linkRow}
        testID="sign-in-to-sign-up"
      >
        <Text style={styles.link}>New here? Create an account</Text>
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
