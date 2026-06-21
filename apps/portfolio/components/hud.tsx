import { useEffect, useState } from "react";
import { Animated, Easing, View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// v2 "Subtle HUD" primitive colors — mirrors tokens.jsx in the design bundle.
export const T = {
  paper: "#F6F4ED",
  paperDeep: "#EEEAE0",
  ink: "#111826",
  inkSoft: "#2A3440",
  inkMid: "rgba(17,24,38,0.60)",
  inkLow: "rgba(17,24,38,0.38)",
  inkHair: "rgba(17,24,38,0.12)",
  inkThread: "rgba(17,24,38,0.22)",
  red: "#D4412A",
  redSoft: "rgba(212,65,42,0.12)",
  redHair: "rgba(212,65,42,0.28)",
  amber: "#C68A1E",
  mint: "#4A7A5E",
  mintSoft: "rgba(74,122,94,0.12)",
  cyan: "#457B9D",
  cyanSoft: "rgba(69,123,157,0.16)",
  onDark: "rgba(246,244,237,0.92)",
  onDarkMid: "rgba(246,244,237,0.70)",
  onDarkLow: "rgba(246,244,237,0.50)",
  onDarkHair: "rgba(246,244,237,0.14)",
  onDarkThread: "rgba(246,244,237,0.28)",
} as const;

type Tone = "mid" | "red" | "ink" | "onDark" | "onDarkMid";

const toneColor: Record<Tone, string> = {
  mid: T.inkMid,
  red: T.red,
  ink: T.ink,
  onDark: T.onDarkMid,
  onDarkMid: T.onDarkLow,
};

// Eyebrow / system label — mono, uppercase, wide-tracked.
export function GCEye({
  children,
  tone = "mid",
  icon,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  className?: string;
}) {
  const color = toneColor[tone];
  return (
    <View className={`flex-row items-center gap-1.5 ${className ?? ""}`}>
      {icon ? (
        <FontAwesome name={icon} size={9} color={color} />
      ) : null}
      <Text
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 10,
          letterSpacing: 1.2,
          color,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Text>
    </View>
  );
}

// Mono tick line — e.g. "001 / 010", coordinates, readouts.
export function GCTick({
  children,
  color,
  size = 9,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <Text
      className={className}
      style={{
        fontFamily: "JetBrainsMono_400Regular",
        fontSize: size,
        letterSpacing: 0.72,
        color: color ?? T.inkLow,
      }}
    >
      {children}
    </Text>
  );
}

type ChipVariant =
  | "ghost"
  | "solid"
  | "red"
  | "redSoft"
  | "mintSoft"
  | "onDark"
  | "onDarkSolid";

const chipStyles: Record<
  ChipVariant,
  { border: string; color: string; background: string }
> = {
  ghost: { border: T.inkHair, color: T.ink, background: "transparent" },
  solid: { border: T.ink, color: T.paper, background: T.ink },
  red: { border: T.red, color: T.paper, background: T.red },
  redSoft: { border: T.redHair, color: T.red, background: T.redSoft },
  mintSoft: {
    border: "rgba(74,122,94,0.35)",
    color: T.mint,
    background: T.mintSoft,
  },
  onDark: {
    border: "rgba(246,244,237,0.22)",
    color: "rgba(246,244,237,0.92)",
    background: "transparent",
  },
  onDarkSolid: { border: T.red, color: T.paper, background: T.red },
};

// HUD chip — mono uppercase capsule, optional dot + icon.
export function GCChip({
  children,
  variant = "ghost",
  size = "sm",
  dot,
  icon,
  className,
}: {
  children: React.ReactNode;
  variant?: ChipVariant;
  size?: "xs" | "sm";
  dot?: string | true;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  className?: string;
}) {
  const s = chipStyles[variant];
  const padding = size === "xs" ? { px: 8, py: 3 } : { px: 10, py: 5 };
  const fontSize = size === "xs" ? 10 : 11;
  const dotColor = dot === true ? T.red : dot;

  return (
    <View
      className={className}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: padding.px,
        paddingVertical: padding.py,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: s.border,
        backgroundColor: s.background,
      }}
    >
      {dotColor ? (
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 9999,
            backgroundColor: dotColor,
          }}
        />
      ) : null}
      {icon ? <FontAwesome name={icon} size={9} color={s.color} /> : null}
      <Text
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize,
          letterSpacing: 0.66,
          color: s.color,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Text>
    </View>
  );
}

// Horizontal dash — technical drawing feel. 1px, dashed via short dash segments.
// React Native's new arch doesn't support `borderStyle: "dashed"` on partial
// borders, so we build the effect out of alternating sub-views instead.
export function GCDash({
  color,
  className,
}: {
  color?: string;
  className?: string;
}) {
  const c = color ?? T.inkThread;
  const segments = 40;
  return (
    <View
      className={className}
      style={{ height: 1, flexDirection: "row", overflow: "hidden" }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 1,
            backgroundColor: i % 2 === 0 ? c : "transparent",
            marginRight: 1,
          }}
        />
      ))}
    </View>
  );
}

// Horizontal dotted hair — finer cadence than GCDash, used as row divider.
export function GCDots({
  color,
  className,
}: {
  color?: string;
  className?: string;
}) {
  const c = color ?? T.inkThread;
  const segments = 80;
  return (
    <View
      className={className}
      style={{ height: 1, flexDirection: "row", overflow: "hidden" }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 1,
            backgroundColor: i % 2 === 0 ? c : "transparent",
          }}
        />
      ))}
    </View>
  );
}

// Vertical dashed rail — used for timeline / skill-tree left rails.
// Fills the parent height; pair with absolute positioning.
export function GCVDash({
  color,
  width = 1,
  style,
}: {
  color?: string;
  width?: number;
  style?: object;
}) {
  const c = color ?? T.inkThread;
  const segments = 60;
  return (
    <View style={[{ width, flexDirection: "column", overflow: "hidden" }, style]}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            width,
            backgroundColor: i % 2 === 0 ? c : "transparent",
            marginBottom: 1,
          }}
        />
      ))}
    </View>
  );
}

// Solid hair — 1px solid divider.
export function GCHair({
  color,
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <View
      className={className}
      style={{ height: 1, backgroundColor: color ?? T.inkHair }}
    />
  );
}

// Key-value — small mono eyebrow label over a value.
export function GCKV({
  label,
  value,
  onDark = false,
  align = "left",
  valueSize = 15,
}: {
  label: string;
  value: string;
  onDark?: boolean;
  align?: "left" | "right" | "center";
  valueSize?: number;
}) {
  return (
    <View
      style={{
        alignItems:
          align === "center"
            ? "center"
            : align === "right"
              ? "flex-end"
              : "flex-start",
      }}
    >
      <GCEye tone={onDark ? "onDark" : "mid"}>{label}</GCEye>
      <Text
        style={{
          marginTop: 3,
          fontFamily: "DMSans_500Medium",
          fontSize: valueSize,
          color: onDark ? T.paper : T.ink,
          letterSpacing: -0.1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// Thin progress bar.
export function GCBar({
  value,
  max = 100,
  color,
  track,
  height = 3,
}: {
  value: number;
  max?: number;
  color?: string;
  track?: string;
  height?: number;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View
      style={{
        width: "100%",
        height,
        backgroundColor: track ?? T.inkHair,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: color ?? T.red,
        }}
      />
    </View>
  );
}

// Status dot with blinking halo.
export function GCStatus({
  color = T.red,
  label,
  dark = false,
}: {
  color?: string;
  label?: string;
  dark?: boolean;
}) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 700,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View className="flex-row items-center gap-2">
      <View style={{ width: 8, height: 8 }}>
        <Animated.View
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: 9999,
            backgroundColor: color,
            opacity,
            transform: [{ scale: 0.6 }],
          }}
        />
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            backgroundColor: color,
          }}
        />
      </View>
      {label ? <GCEye tone={dark ? "onDark" : "mid"}>{label}</GCEye> : null}
    </View>
  );
}

// Screen header — eyebrow + meta + large display title + sub + optional hair.
export function GCScreenHeader({
  eyebrow,
  title,
  sub,
  meta,
  onDark = false,
  withDivider = true,
  accent = false,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  meta?: string;
  onDark?: boolean;
  withDivider?: boolean;
  accent?: boolean;
}) {
  return (
    <View
      style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <GCEye tone={accent ? "red" : onDark ? "onDark" : "mid"}>
          {eyebrow}
        </GCEye>
        {meta ? (
          <GCTick color={onDark ? T.onDarkLow : undefined}>{meta}</GCTick>
        ) : null}
      </View>
      <Text
        style={{
          fontFamily: "DMSans_500Medium",
          fontSize: 38,
          lineHeight: 40,
          letterSpacing: -1.3,
          color: onDark ? T.paper : T.ink,
        }}
      >
        {title}
      </Text>
      {sub ? (
        <Text
          style={{
            marginTop: 12,
            fontFamily: "DMSans_400Regular",
            fontSize: 13,
            lineHeight: 20,
            color: onDark ? T.onDarkMid : T.inkMid,
            maxWidth: "92%",
          }}
        >
          {sub}
        </Text>
      ) : null}
      {withDivider ? (
        <GCHair
          color={onDark ? T.onDarkHair : undefined}
          className="mt-5"
        />
      ) : null}
    </View>
  );
}

// Subtle container — optional hairline border; supports a dark surface variant.
export function GCCard({
  children,
  dark = false,
  bordered = true,
  padded = true,
  className,
  style,
}: {
  children: React.ReactNode;
  dark?: boolean;
  bordered?: boolean;
  padded?: boolean;
  className?: string;
  style?: object;
}) {
  return (
    <View
      className={className}
      style={{
        position: "relative",
        borderRadius: 20,
        borderWidth: bordered ? 1 : 0,
        borderColor: dark ? T.onDarkHair : T.inkHair,
        backgroundColor: dark ? T.ink : "transparent",
        padding: padded ? 18 : 0,
        ...(style ?? {}),
      }}
    >
      {children}
    </View>
  );
}
