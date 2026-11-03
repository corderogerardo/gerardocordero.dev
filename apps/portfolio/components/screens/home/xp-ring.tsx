import { View, Text } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { T } from "@/components/hud";

export function XPRing({
  years,
  progress = 0.92,
}: {
  years: number;
  progress?: number;
}) {
  const size = 168;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const innerR = r - 6;
  const c = 2 * Math.PI * innerR;
  const dashArray = `${c * progress} ${c}`;
  const cx = size / 2;
  const cy = size / 2;
  const ticks = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={T.inkThread}
          strokeWidth={1}
          strokeDasharray="2 5"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="none"
          stroke={T.red}
          strokeWidth={stroke}
          strokeDasharray={dashArray}
          strokeDashoffset={c * 0.25}
          // SVG transform string (not the rotation/originX/originY props) so
          // react-native-svg's web shim emits a valid `transform` attribute
          // instead of an invalid `transform-origin` DOM prop. Rotates the arc
          // so it starts at 12 o'clock, identical on native and web.
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
        {ticks.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * (r - 12);
          const y1 = cy + Math.sin(rad) * (r - 12);
          const x2 = cx + Math.cos(rad) * (r - 4);
          const y2 = cy + Math.sin(rad) * (r - 4);
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={T.inkThread}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 10,
            letterSpacing: 1.5,
            color: T.red,
            textTransform: "uppercase",
          }}
        >
          LVL · 10
        </Text>
        <Text
          style={{
            fontFamily: "DMSans_500Medium",
            fontSize: 68,
            lineHeight: 72,
            letterSpacing: -4,
            color: T.ink,
            marginTop: 2,
          }}
        >
          {years}
        </Text>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 9,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: T.inkMid,
            marginTop: 2,
          }}
        >
          YR · EXP
        </Text>
      </View>
    </View>
  );
}
