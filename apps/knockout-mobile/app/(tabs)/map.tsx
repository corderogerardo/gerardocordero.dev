import { Text } from "react-native";

import { Screen } from "../../src/ui/Screen";
import { colors, font } from "../../src/ui/tokens";

export default function MapScreen() {
  return (
    <Screen testID="screen-map" title="Territory" subtitle="Your zone, the properties, and where you are.">
      <Text style={{ color: colors.textMuted, fontSize: font.body }}>
        Map, geofence, and the knock sheet land in T11.
      </Text>
    </Screen>
  );
}
