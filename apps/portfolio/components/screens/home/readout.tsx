import { View, Text } from "react-native";
import { GCBar, GCEye, GCTick, T } from "@/components/hud";

/** Label + value + meter row used by the home screen's readout column. */
export function Readout({
  label,
  value,
  bar,
  sub,
  color,
}: {
  label: string;
  value: string;
  bar: { value: number; max: number };
  sub?: string;
  color?: string;
}) {
  return (
    <View>
      <View className="mb-1.5 flex-row items-baseline justify-between">
        <GCEye>{label}</GCEye>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 13,
            color: T.ink,
          }}
        >
          {value}
        </Text>
      </View>
      <GCBar value={bar.value} max={bar.max} color={color ?? T.ink} height={3} />
      {sub ? (
        <View className="mt-1">
          <GCTick>{sub}</GCTick>
        </View>
      ) : null}
    </View>
  );
}
