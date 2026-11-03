import { Text } from "react-native";

import { Screen } from "../../src/ui/Screen";
import { colors, font } from "../../src/ui/tokens";

export default function ShiftScreen() {
  return (
    <Screen testID="screen-shift" title="Shift" subtitle="Start your shift and see today's numbers.">
      <Text style={{ color: colors.textMuted, fontSize: font.body }}>
        Shift controls land in T10. Until then this screen exists so the app boots and the e2e
        selector is stable.
      </Text>
    </Screen>
  );
}
