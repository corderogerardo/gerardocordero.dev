import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { education, type Education } from "@/src/data/education";
import {
  GCChip,
  GCDash,
  GCDots,
  GCEye,
  GCScreenHeader,
  GCStatus,
  GCTick,
  GCVDash,
  T,
} from "@/components/hud";

type SkillNode = { name: string; years: number };

type Branch = {
  branch: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  nodes: SkillNode[];
};

// years = approximate years of hands-on experience per skill (review/adjust).
const SKILL_TREE: Branch[] = [
  {
    branch: "Mobile",
    icon: "mobile",
    nodes: [
      { name: "React Native", years: 8 },
      { name: "Expo", years: 6 },
      { name: "iOS", years: 6 },
      { name: "Android", years: 6 },
      { name: "Hermes", years: 3 },
    ],
  },
  {
    branch: "Frontend",
    icon: "code",
    nodes: [
      { name: "React", years: 8 },
      { name: "TypeScript", years: 6 },
      { name: "JavaScript", years: 10 },
      { name: "Angular", years: 3 },
    ],
  },
  {
    branch: "Backend",
    icon: "server",
    nodes: [
      { name: "Node.js", years: 8 },
      { name: "Express", years: 7 },
      { name: "AWS", years: 4 },
      { name: "Amplify", years: 3 },
    ],
  },
  {
    branch: "Practice",
    icon: "flask",
    nodes: [
      { name: "Testing", years: 7 },
      { name: "Monorepos", years: 4 },
      { name: "Open Source", years: 5 },
      { name: "Accessibility", years: 3 },
    ],
  },
];

function SkillBranch({
  branch,
  nodes,
  icon,
  accent,
}: Branch & { accent?: boolean }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderWidth: 1,
            borderColor: T.ink,
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name={icon} size={12} color={T.ink} />
        </View>
        <Text
          style={{
            fontFamily: "DMSans_500Medium",
            fontSize: 17,
            letterSpacing: -0.4,
            color: T.ink,
          }}
        >
          {branch}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: T.inkHair }} />
        <GCTick>{String(nodes.length).padStart(2, "0")} NODES</GCTick>
      </View>
      <View
        style={{
          paddingLeft: 14,
          gap: 8,
          position: "relative",
        }}
      >
        <GCVDash
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        />
        {nodes.map((n, i) => {
          const isPrimary = accent && i === 0;
          return (
            <View
              key={n.name}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: -14,
                  top: "50%",
                  width: 10,
                  height: 1,
                  backgroundColor: T.inkThread,
                }}
              />
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: isPrimary ? T.red : T.paper,
                  borderWidth: 1,
                  borderColor: isPrimary ? T.red : T.ink,
                }}
              />
              <Text
                style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 14,
                  color: T.ink,
                  letterSpacing: -0.1,
                }}
              >
                {n.name}
              </Text>
              <View
                style={{
                  marginLeft: "auto",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {isPrimary ? (
                  <GCChip variant="redSoft" size="xs">
                    PRIMARY
                  </GCChip>
                ) : null}
                <GCTick>{`${n.years}Y`}</GCTick>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FormalDegree({ edu }: { edu: Education }) {
  const isCompleted = edu.status === "completed";
  const isLeft = edu.status === "left";
  const topics = edu.topics
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const fg = isCompleted ? T.paper : T.ink;
  const dimFg = isCompleted ? "rgba(246,244,237,0.6)" : T.inkMid;
  const dashedColor = isCompleted ? "rgba(246,244,237,0.25)" : T.inkThread;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: isCompleted ? T.ink : T.inkThread,
        borderRadius: 14,
        padding: 18,
        backgroundColor: isCompleted ? T.ink : "transparent",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <GCEye tone={isCompleted ? "onDark" : "mid"}>
          {isCompleted ? "ACHIEVEMENT · UNLOCKED" : "STATUS · LEFT"}
        </GCEye>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: isCompleted ? "rgba(246,244,237,0.28)" : T.inkHair,
          }}
        >
          <Text
            style={{
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 9,
              letterSpacing: 0.72,
              color: isCompleted ? "rgba(246,244,237,0.75)" : T.inkMid,
            }}
          >
            {edu.period}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: "DMSans_500Medium",
          fontSize: 22,
          lineHeight: 26,
          letterSpacing: -0.5,
          color: fg,
        }}
      >
        {edu.institution}
      </Text>
      {edu.location ? (
        <Text
          style={{
            marginTop: 4,
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 10,
            color: dimFg,
            letterSpacing: 0.6,
          }}
        >
          · {edu.location.toUpperCase()}
        </Text>
      ) : null}

      <View style={{ marginTop: 14 }}>
        <GCDash color={dashedColor} />
      </View>
      <View
        style={{
          marginTop: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "baseline",
        }}
      >
        <View style={{ flex: 1 }}>
          <GCEye tone={isCompleted ? "onDark" : "mid"}>DEGREE</GCEye>
          <Text
            style={{
              marginTop: 2,
              fontFamily: "DMSans_500Medium",
              fontSize: 15,
              color: fg,
              letterSpacing: -0.15,
            }}
          >
            {edu.degree}
          </Text>
          {edu.field ? (
            <Text
              style={{
                marginTop: 2,
                fontFamily: "DMSans_400Regular",
                fontSize: 12,
                color: isCompleted ? "rgba(246,244,237,0.7)" : T.inkMid,
              }}
            >
              {edu.field}
            </Text>
          ) : null}
        </View>
        {isCompleted ? (
          <Text
            style={{
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 18,
              color: T.paper,
              letterSpacing: -0.3,
            }}
          >
            ✓
          </Text>
        ) : isLeft ? (
          <Text
            style={{
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 10,
              color: T.inkMid,
              letterSpacing: 1,
            }}
          >
            ↗ EXITED
          </Text>
        ) : null}
      </View>

      {topics.length > 0 && isCompleted ? (
        <View style={{ marginTop: 16 }}>
          <GCEye tone="onDark">TRAINING DATA</GCEye>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {topics.map((t) => (
              <View
                key={t}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: "rgba(246,244,237,0.3)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 10,
                    letterSpacing: 0.6,
                    color: T.paper,
                  }}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CourseEntry({
  edu,
  index,
  isLast,
}: {
  edu: Education;
  index: number;
  isLast: boolean;
}) {
  const topics = edu.topics
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <View>
    <View
      style={{
        flexDirection: "row",
        gap: 14,
        paddingVertical: 12,
        alignItems: "flex-start",
      }}
    >
      <View style={{ width: 50, paddingTop: 2 }}>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 10,
            color: T.red,
            letterSpacing: 0.6,
          }}
        >
          · {String(index + 1).padStart(2, "0")}
        </Text>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 9,
            color: T.inkLow,
            letterSpacing: 0.6,
            marginTop: 2,
          }}
        >
          {edu.period}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "DMSans_500Medium",
            fontSize: 16,
            letterSpacing: -0.2,
            color: T.ink,
          }}
        >
          {edu.degree}
        </Text>
        <Text
          style={{
            marginTop: 3,
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 10,
            color: T.inkMid,
            letterSpacing: 0.6,
          }}
        >
          {edu.institution.toUpperCase()}
        </Text>
        {topics.length > 0 ? (
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {topics.map((t, i) => (
              <Text
                key={t}
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 10,
                  color: T.inkMid,
                  letterSpacing: 0.4,
                }}
              >
                {i > 0 ? `· ${t}` : t}{" "}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
      <Text
        style={{
          paddingTop: 4,
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 14,
          color: T.red,
        }}
      >
        ✓
      </Text>
    </View>
    {isLast ? null : <GCDots />}
    </View>
  );
}

export default function EducationScreen() {
  const insets = useSafeAreaInsets();
  const formal = education.filter((e) => e.kind === "formal");
  const courses = education.filter((e) => e.kind === "course");
  const totalNodes = SKILL_TREE.reduce((a, b) => a + b.nodes.length, 0);

  return (
    <ScrollView
      testID="screen-education"
      style={{ flex: 1, backgroundColor: T.paper }}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 4 }} />

      <GCScreenHeader
        eyebrow="§ STUDIES"
        title="Skill Tree."
        sub="Formal training, foundational degrees, and continuous self-directed learning."
        meta={`${String(formal.length).padStart(
          2,
          "0",
        )} DEGREES · ${String(courses.length).padStart(2, "0")} COURSES`}
      />

      {/* §01 Competency Tree */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <GCEye tone="red">§ 01 · COMPETENCY TREE</GCEye>
          <GCTick>{totalNodes} NODES TOTAL</GCTick>
        </View>
        {SKILL_TREE.map((b, i) => (
          <SkillBranch key={b.branch} {...b} accent={i === 0} />
        ))}
      </View>

      <GCDash className="mx-5 my-4" />

      {/* §02 Formal Degrees */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <View className="mb-3.5 flex-row items-center justify-between">
          <GCEye tone="red">§ 02 · FORMAL · DEGREES</GCEye>
          <GCTick>
            {String(formal.length).padStart(2, "0")} /{" "}
            {String(formal.length).padStart(2, "0")}
          </GCTick>
        </View>
        <View style={{ gap: 12 }}>
          {formal.map((d) => (
            <FormalDegree
              key={`${d.institution}-${d.period}`}
              edu={d}
            />
          ))}
        </View>
      </View>

      <GCDash className="mx-5 mt-7 mb-4" />

      {/* §03 Continuous Courses */}
      <View style={{ paddingHorizontal: 20 }}>
        <View className="mb-2 flex-row items-center justify-between">
          <GCEye tone="red">§ 03 · CONTINUOUS · COURSES</GCEye>
          <GCTick>
            {String(courses.length).padStart(2, "0")} COMPLETED
          </GCTick>
        </View>
        {courses.map((c, i) => (
          <CourseEntry
            key={`${c.institution}-${c.degree}-${c.period}`}
            edu={c}
            index={i}
            isLast={i === courses.length - 1}
          />
        ))}
      </View>

      {/* Always Shipping — background process card */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: T.ink,
            borderRadius: 14,
            padding: 18,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <GCEye tone="red">SYSTEM · BACKGROUND PROCESS</GCEye>
            <GCStatus color={T.red} label="RUNNING" />
          </View>
          <Text
            style={{
              fontFamily: "DMSans_500Medium",
              fontSize: 26,
              letterSpacing: -0.9,
              lineHeight: 28,
              color: T.ink,
            }}
          >
            Always shipping.
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontFamily: "DMSans_400Regular",
              fontSize: 13,
              lineHeight: 20,
              color: T.inkMid,
            }}
          >
            Continuous learning via real projects, open source, and the daily
            practice of shipping mobile software.
          </Text>
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {[
              "English · C1",
              "Self-Directed",
              "Open Source",
              "RN Best Practices",
              "Hermes",
            ].map((t) => (
              <GCChip key={t} variant="ghost" size="xs">
                {t}
              </GCChip>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
