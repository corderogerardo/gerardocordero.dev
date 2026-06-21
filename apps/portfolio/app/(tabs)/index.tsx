import { View, Text, ScrollView, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line } from "react-native-svg";
import { experiences } from "@/src/data/experience";
import { projects } from "@/src/data/projects";
import {
  GCBar,
  GCChip,
  GCDash,
  GCDots,
  GCEye,
  GCHair,
  GCKV,
  GCStatus,
  GCTick,
  T,
} from "@/components/hud";

const STACK = [
  "React",
  "React Native",
  "TypeScript",
  "Node.js",
  "Expo",
  "JavaScript",
];

const INTERESTS = [
  { label: "AI", verb: "Explore" },
  { label: "Video Games", verb: "Play" },
  { label: "Data", verb: "Build" },
  { label: "Languages", verb: "Learn" },
];

const YEARS: { label: string; value: number; unit: string }[] = [
  { label: "JS", value: 10, unit: "Y" },
  { label: "REACT / RN", value: 8, unit: "Y" },
  { label: "EXPRESS", value: 3, unit: "Y" },
  { label: "ANGULAR", value: 2, unit: "Y" },
];

function XPRing({
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
          originX={cx}
          originY={cy}
          rotation={-90}
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

function Readout({
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const currentExp = experiences.find((e) => e.isCurrent) ?? experiences[0];
  const shipCount = String(projects.length).padStart(2, "0");
  const storeCount = String(
    projects.filter((p) => p.linkLabel === "App Store").length,
  ).padStart(2, "0");

  return (
    <ScrollView
      testID="screen-status"
      style={{ flex: 1, backgroundColor: T.paper }}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />

      {/* System status bar */}
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 20,
          paddingBottom: 4,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <GCStatus label="ONLINE · AVAILABLE" />
        <GCTick>10.06°N 69.36°W · UTC-4</GCTick>
      </View>

      {/* Header block — name + monogram mark */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View className="flex-row items-start justify-between">
          <View style={{ flex: 1 }}>
            <GCEye tone="red">PLAYER · 001</GCEye>
            <Text
              style={{
                marginTop: 8,
                fontFamily: "DMSans_500Medium",
                fontSize: 40,
                lineHeight: 40,
                letterSpacing: -1.6,
                color: T.ink,
              }}
            >
              Gerardo
            </Text>
            <Text
              style={{
                fontFamily: "DMSans_500Medium",
                fontSize: 40,
                lineHeight: 40,
                letterSpacing: -1.6,
                color: T.ink,
              }}
            >
              Cordero.
            </Text>
            <Text
              style={{
                marginTop: 14,
                fontFamily: "DMSans_500Medium",
                fontSize: 14,
                color: T.ink,
              }}
            >
              {currentExp.role}
            </Text>
            <View className="mt-0.5">
              <GCEye>
                @ {currentExp.company.toUpperCase()} · {currentExp.location.toUpperCase()}
              </GCEye>
            </View>
          </View>
          <View
            style={{
              width: 52,
              height: 52,
              borderWidth: 1,
              borderColor: T.ink,
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono_500Medium",
                fontSize: 20,
                letterSpacing: -0.4,
                color: T.ink,
              }}
            >
              GC
            </Text>
          </View>
        </View>
        <GCHair className="mt-5" />
      </View>

      {/* XP ring + readouts */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        }}
      >
        <XPRing years={10} />
        <View style={{ flex: 1, gap: 14 }}>
          <Readout
            label="Companies"
            value="10"
            bar={{ value: 10, max: 12 }}
            sub="2016 → 2026"
          />
          <Readout
            label="Stack · Depth"
            value="06"
            bar={{ value: 6, max: 6 }}
            sub="Native + Web + Cloud"
            color={T.red}
          />
          <Readout
            label="Availability"
            value="OPEN"
            bar={{ value: 95, max: 100 }}
            sub="Contract · Remote"
            color={T.mint}
          />
        </View>
      </View>

      <GCDash className="mx-5" />

      {/* §01 Overview */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View className="mb-3 flex-row items-center justify-between">
          <GCEye tone="red">§ 01 · OVERVIEW</GCEye>
          <GCChip variant="ghost" size="xs">
            REMOTE · GLOBAL
          </GCChip>
        </View>
        <Text
          style={{
            fontFamily: "DMSans_400Regular",
            fontSize: 15,
            lineHeight: 22,
            color: T.ink,
            maxWidth: "95%",
          }}
        >
          Full-stack developer focused on{" "}
          <Text
            style={{ color: T.red, fontFamily: "DMSans_500Medium" }}
          >
            mobile
          </Text>
          . 10+ years remote across education, financial education, private
          markets, home services, telecom, and staff augmentation. Deeply
          invested in developer experience — reviews, tests, and shipping
          quality.
        </Text>

        {/* Years-in-stack grid */}
        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: 16,
            rowGap: 10,
          }}
        >
          {YEARS.map((y) => (
            <View
              key={y.label}
              style={{ width: "47%", paddingBottom: 6 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  paddingBottom: 6,
                }}
              >
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 10,
                  color: T.inkMid,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                {y.label}
              </Text>
              <Text
                style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 18,
                  letterSpacing: -0.4,
                  color: T.ink,
                }}
              >
                {y.value}
                <Text
                  style={{
                    fontSize: 10,
                    color: T.inkMid,
                  }}
                >
                  {y.unit}
                </Text>
              </Text>
              </View>
              <GCDots />
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 28 }} />
      <GCDash className="mx-5" />

      {/* §02 Loadout */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View className="mb-3.5 flex-row items-center justify-between">
          <GCEye tone="red">§ 02 · LOADOUT</GCEye>
          <GCTick>STACK · 06 / ACTIVE</GCTick>
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          {STACK.map((tech, i) => (
            <GCChip
              key={tech}
              variant={i === 0 ? "solid" : "ghost"}
            >
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 9,
                  color: i === 0 ? "rgba(246,244,237,0.55)" : T.inkLow,
                  letterSpacing: 0.66,
                }}
              >
                {String(i + 1).padStart(2, "0")}
                {"  "}
              </Text>
              {tech}
            </GCChip>
          ))}
        </View>
      </View>

      <View style={{ height: 28 }} />

      {/* §03 Home Base — dark card with grid overlay */}
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            backgroundColor: T.ink,
            borderRadius: 20,
            padding: 20,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <GCEye tone="onDark">§ 03 · HOME BASE</GCEye>
            <GCStatus label="ACTIVE" dark />
          </View>
          <Text
            style={{
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 9,
              color: "rgba(246,244,237,0.5)",
              letterSpacing: 1.35,
              marginBottom: 6,
            }}
          >
            N 10°04&apos;04&quot; · W 69°19&apos;04&quot;
          </Text>
          <Text
            style={{
              fontFamily: "DMSans_500Medium",
              fontSize: 32,
              letterSpacing: -1,
              lineHeight: 32,
              color: T.paper,
            }}
          >
            Barquisimeto
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: "DMSans_400Regular",
              fontSize: 13,
              color: "rgba(246,244,237,0.7)",
            }}
          >
            Venezuela
          </Text>
          <View
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: T.onDarkHair,
              flexDirection: "row",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <GCKV label="PREV" value="Lima, PE" onDark valueSize={13} />
            </View>
            <View style={{ flex: 1 }}>
              <GCKV label="RETURN" value="OCT 2022" onDark valueSize={13} />
            </View>
            <View style={{ flex: 1 }}>
              <GCKV label="UTC" value="−04:00" onDark valueSize={13} />
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 28 }} />

      {/* §04 Interests */}
      <View style={{ paddingHorizontal: 20 }}>
        <View className="mb-3 flex-row items-center justify-between">
          <GCEye tone="red">§ 04 · INTERESTS</GCEye>
          <GCTick>04 VECTORS</GCTick>
        </View>
        <View>
          {INTERESTS.map((it, i) => (
            <View key={it.label}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 10,
                    color: T.inkLow,
                    width: 22,
                    letterSpacing: 0.66,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text
                  style={{
                    fontFamily: "DMSans_500Medium",
                    fontSize: 20,
                    letterSpacing: -0.4,
                    color: T.ink,
                  }}
                >
                  {it.label}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 10,
                  color: T.inkMid,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {it.verb}
              </Text>
            </View>
            {i < INTERESTS.length - 1 ? <GCDots /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 32 }} />

      {/* §05 Quick portals */}
      <View style={{ paddingHorizontal: 20 }}>
        <View className="mb-3">
          <GCEye tone="red">§ 05 · QUICK PORTALS</GCEye>
        </View>
        <View style={{ gap: 10 }}>
          {(
            [
              {
                href: "/projects",
                icon: "rocket",
                label: "Fleet",
                sub: `${shipCount} ships · ${storeCount} on the App Store`,
              },
              {
                href: "/experience",
                icon: "briefcase",
                label: "Mission Log",
                sub: `${String(experiences.length).padStart(2, "0")} quests · 10+ years`,
              },
              {
                href: "/education",
                icon: "graduation-cap",
                label: "Skill Tree",
                sub: "06 nodes · 02 formal",
              },
              {
                href: "/contact",
                icon: "paper-plane",
                label: "Comms",
                sub: "mail · 3 channels",
              },
            ] as const
          ).map((q) => (
            <Link key={q.href} href={q.href} asChild>
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: T.inkHair,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: T.ink,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesome
                    name={q.icon}
                    size={14}
                    color={T.ink}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "DMSans_500Medium",
                      fontSize: 17,
                      letterSpacing: -0.2,
                      color: T.ink,
                    }}
                  >
                    {q.label}
                  </Text>
                  <Text
                    style={{
                      marginTop: 1,
                      fontFamily: "JetBrainsMono_500Medium",
                      fontSize: 10,
                      color: T.inkMid,
                      letterSpacing: 0.6,
                    }}
                  >
                    {q.sub}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 14,
                    color: T.red,
                  }}
                >
                  →
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* Footer signature */}
      <View style={{ paddingHorizontal: 20 }}>
        <GCDash />
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <GCTick>GC · PORTFOLIO · v2.0 / 2026</GCTick>
          <GCTick>BUILD 0417</GCTick>
        </View>
      </View>
    </ScrollView>
  );
}
