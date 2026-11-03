import { Stack } from "expo-router";

import { colors } from "../../src/ui/tokens";

/** The signed-out group. One screen today; the shape is here for reset/verify flows. */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
