import { Text } from "react-native";

import { Screen } from "../../src/ui/Screen";
import { colors, font } from "../../src/ui/tokens";

export default function LeadsScreen() {
  return (
    <Screen testID="screen-leads" title="Leads" subtitle="Everything you captured, synced or not.">
      <Text style={{ color: colors.textMuted, fontSize: font.body }}>
        Lead list, detail, and capture land in T12.
      </Text>
    </Screen>
  );
}
