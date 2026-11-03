import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { isLocalStack } from "../../src/api/config";
import { useSessionStore } from "../../src/data/session";
import { Button } from "../../src/ui/Button";
import { Field } from "../../src/ui/Field";
import { colors, font, radius, space, weight } from "../../src/ui/tokens";

/**
 * Sign in.
 *
 * Deliberately boring: one form, one error line, one button. The interesting part
 * is what happens after the tap, and that lives in the session store so it can be
 * tested without rendering anything.
 */
export default function SignInScreen() {
  const signIn = useSessionStore((state) => state.signIn);
  const busy = useSessionStore((state) => state.busy);
  const error = useSessionStore((state) => state.error);
  const clearError = useSessionStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const onSubmit = () => {
    void signIn(email.trim(), password).then(() => {
      // The route guard reacts to the session state; this only fires on success
      // while the auth group is still mounted, and is harmless if it does not.
      if (useSessionStore.getState().status === "signed_in") router.replace("/(tabs)");
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          testID="screen-sign-in"
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.wordmark}>Knockout</Text>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Field leads, offline. Every knock is saved on this phone first.
            </Text>
          </View>

          <View style={styles.card}>
            <Field
              testID="sign-in-email"
              label="Email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) clearError();
              }}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@contractor.test"
            />
            <Field
              testID="sign-in-password"
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (error) clearError();
              }}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={() => {
                if (canSubmit) onSubmit();
              }}
              returnKeyType="go"
              placeholder="••••••••"
            />

            {error ? (
              <Text testID="sign-in-error" style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Button
              testID="sign-in-submit"
              label="Sign in"
              onPress={onSubmit}
              disabled={!canSubmit}
              busy={busy}
            />
          </View>

          {isLocalStack ? (
            <Text style={styles.hint}>
              Local demo: marcus@northwind.test / knockout123 (see supabase/seed.sql).
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: space[4], paddingTop: space[6], gap: space[5] },
  header: { gap: space[1] },
  wordmark: {
    color: colors.brand,
    fontSize: font.label,
    fontWeight: weight.bold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: font.display, fontWeight: weight.bold },
  subtitle: { color: colors.textMuted, fontSize: font.body, lineHeight: 21 },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
  },
  error: { color: colors.danger, fontSize: font.label, lineHeight: 18 },
  hint: { color: colors.textMuted, fontSize: font.caption, textAlign: "center" },
});
