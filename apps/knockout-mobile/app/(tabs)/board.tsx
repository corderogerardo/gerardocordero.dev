import { Text } from "react-native";

import { Screen } from "../../src/ui/Screen";
import { colors, font } from "../../src/ui/tokens";

export default function BoardScreen() {
  return (
    <Screen testID="screen-board" title="Board" subtitle="Your rank, your streak, your team.">
      <Text style={{ color: colors.textMuted, fontSize: font.body }}>
        Leaderboard, badges, and Realtime land in T13–T14.
      </Text>
    </Screen>
  );
}
