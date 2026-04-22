import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { experiences, type Experience } from "@/src/data/experience";
import {
  GCChip,
  GCEye,
  GCScreenHeader,
  GCTick,
  GCVDash,
  T,
} from "@/components/hud";

function startCode(period: string) {
  const [start] = period.split("—");
  const trimmed = start.trim();
  const match = trimmed.match(/(\w+)\s+(\d{4})/);
  if (!match) return trimmed;
  const month: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  return `${match[2]}.${month[match[1]] ?? "01"}`;
}

function MissionCard({
  exp,
  index,
  total,
}: {
  exp: Experience;
  index: number;
  total: number;
}) {
  const isCurrent = !!exp.isCurrent;
  const num = String(total - index).padStart(2, "0");

  return (
    <View
      style={{
        position: "relative",
        paddingLeft: 32,
        paddingBottom: 28,
        marginLeft: 20,
      }}
    >
      {/* Timeline rail */}
      {isCurrent ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: T.red,
          }}
        />
      ) : (
        <GCVDash
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        />
      )}

      {/* Timeline node */}
      <View
        style={{
          position: "absolute",
          left: -7,
          top: 0,
          width: 13,
          height: 13,
          borderRadius: 9999,
          backgroundColor: T.paper,
          borderWidth: 1.5,
          borderColor: isCurrent ? T.red : T.ink,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCurrent ? (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 9999,
              backgroundColor: T.red,
            }}
          />
        ) : null}
      </View>

      {/* Start-date tick on the rail */}
      <View
        style={{
          position: "absolute",
          left: -56,
          top: -2,
          width: 44,
          alignItems: "flex-end",
        }}
      >
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 9,
            color: T.inkMid,
            letterSpacing: 0.72,
          }}
        >
          {startCode(exp.period)}
        </Text>
      </View>

      {/* Mission number + status */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <GCEye tone="red">MISSION · {num}</GCEye>
        {isCurrent ? (
          <GCChip variant="red" size="xs" dot="#fff">
            LIVE
          </GCChip>
        ) : (
          <GCChip variant="ghost" size="xs">
            SHIPPED
          </GCChip>
        )}
      </View>

      {/* Company */}
      <Text
        style={{
          marginTop: 4,
          marginBottom: 2,
          fontFamily: "DMSans_500Medium",
          fontSize: 26,
          letterSpacing: -0.8,
          color: T.ink,
          lineHeight: 28,
        }}
      >
        {exp.company}
      </Text>
      <Text
        style={{
          fontFamily: "DMSans_500Medium",
          fontSize: 13,
          color: T.red,
          marginBottom: 4,
        }}
      >
        {exp.role}
      </Text>
      <Text
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 10,
          color: T.inkMid,
          letterSpacing: 0.8,
        }}
      >
        {exp.period.toUpperCase()} · {exp.employmentType.toUpperCase()} ·{" "}
        {exp.location.toUpperCase()}
      </Text>

      {/* Description */}
      <Text
        style={{
          marginTop: 14,
          fontFamily: "DMSans_400Regular",
          fontSize: 14,
          lineHeight: 21,
          color: T.inkSoft,
        }}
      >
        {exp.description}
      </Text>

      {/* Highlights */}
      {exp.highlights.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <GCEye>LOG ENTRIES</GCEye>
          <View style={{ marginTop: 8, gap: 8 }}>
            {exp.highlights.map((hl, i) => (
              <View key={hl} style={{ flexDirection: "row", gap: 10 }}>
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 10,
                    color: T.red,
                    letterSpacing: 0.6,
                    minWidth: 24,
                    paddingTop: 2,
                  }}
                >
                  · {String(i + 1).padStart(2, "0")}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: "DMSans_400Regular",
                    fontSize: 13,
                    lineHeight: 20,
                    color: T.ink,
                  }}
                >
                  {hl}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Projects */}
      {exp.projects.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <GCEye>PROJECTS SHIPPED</GCEye>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {exp.projects.map((p) => (
              <GCChip key={p} variant="redSoft">
                {p}
              </GCChip>
            ))}
          </View>
        </View>
      ) : null}

      {/* Skills */}
      {exp.skills.length > 0 ? (
        <View style={{ marginTop: 14 }}>
          <GCEye>STACK</GCEye>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {exp.skills.map((s) => (
              <GCChip key={s} variant="ghost" size="xs">
                {s}
              </GCChip>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function ExperienceScreen() {
  const insets = useSafeAreaInsets();
  const total = experiences.length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.paper }}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 4 }} />

      <GCScreenHeader
        eyebrow="§ CAREER LOG"
        title="Mission Log."
        sub="Shipped roles and projects since 2016. Most recent on top, threaded by start date."
        meta={`${String(total).padStart(2, "0")} / ${String(total).padStart(
          2,
          "0",
        )} MISSIONS`}
      />

      {/* Summary stats strip */}
      <View
        style={{
          marginHorizontal: 20,
          flexDirection: "row",
          borderWidth: 1,
          borderColor: T.inkHair,
          marginBottom: 4,
        }}
      >
        {[
          { label: "YEARS", value: "10+" },
          { label: "MISSIONS", value: String(total).padStart(2, "0") },
          { label: "SHIPS", value: "08" },
        ].map((s, i) => (
          <View
            key={s.label}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              borderLeftWidth: i === 0 ? 0 : 1,
              borderLeftColor: T.inkHair,
            }}
          >
            <Text
              style={{
                fontFamily: "DMSans_500Medium",
                fontSize: 28,
                letterSpacing: -1.1,
                color: T.ink,
                lineHeight: 28,
              }}
            >
              {s.value}
            </Text>
            <View style={{ marginTop: 4 }}>
              <GCEye>{s.label}</GCEye>
            </View>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 4,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                backgroundColor: T.red,
              }}
            />
            <GCEye>LIVE</GCEye>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                backgroundColor: T.paper,
                borderWidth: 1.5,
                borderColor: T.ink,
              }}
            />
            <GCEye>SHIPPED</GCEye>
          </View>
        </View>
        <GCTick>NEWEST → OLDEST</GCTick>
      </View>

      {/* Timeline */}
      <View style={{ paddingTop: 18, paddingLeft: 40, paddingRight: 16 }}>
        {experiences.map((exp, i) => (
          <MissionCard
            key={`${exp.company}-${exp.period}`}
            exp={exp}
            index={i}
            total={total}
          />
        ))}

        {/* End of timeline marker */}
        <View style={{ marginLeft: 20, position: "relative" }}>
          <View
            style={{
              position: "absolute",
              left: -7,
              top: 0,
              width: 13,
              height: 13,
              borderRadius: 9999,
              backgroundColor: T.paper,
              borderWidth: 1.5,
              borderColor: T.inkThread,
            }}
          />
          <View style={{ paddingLeft: 32, paddingBottom: 20 }}>
            <GCEye>START · JUL 2016</GCEye>
            <Text
              style={{
                marginTop: 4,
                fontFamily: "DMSans_400Regular",
                fontSize: 13,
                color: T.inkMid,
              }}
            >
              Earlier roles redacted — available on request.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
