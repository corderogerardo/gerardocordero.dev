import { Text } from "react-native";

import { Screen } from "../../src/ui/Screen";
import { colors, font } from "../../src/ui/tokens";

export default function SettingsScreen() {
  return (
    <Screen testID="screen-settings" title="Settings" subtitle="Account, permissions, and sync diagnostics.">
      <Text style={{ color: colors.textMuted, fontSize: font.body }}>
        Account, permission controls, and the sync diagnostics screen land in T13.
      </Text>
    </Screen>
  );
}
