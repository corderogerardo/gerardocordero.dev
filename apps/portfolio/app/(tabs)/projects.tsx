import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { projects, type Project } from "@/src/data/projects";
import {
  GCChip,
  GCDash,
  GCEye,
  GCHair,
  GCScreenHeader,
  GCStatus,
  GCTick,
  T,
} from "@/components/hud";

const PLATFORM_ICON: Record<
  string,
  React.ComponentProps<typeof FontAwesome>["name"]
> = {
  iOS: "apple",
  Android: "android",
  Web: "globe",
};

function PlatformIcons({
  platforms,
  onDark = false,
}: {
  platforms: Project["platforms"];
  onDark?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {platforms.map((p) => (
        <FontAwesome
          key={p}
          name={PLATFORM_ICON[p] ?? "mobile"}
          size={13}
          color={onDark ? T.onDarkMid : T.inkMid}
        />
      ))}
    </View>
  );
}

// Dark hero card for the flagship project.
function FlagshipCard({ project }: { project: Project }) {
  const tappable = !!project.href;
  return (
    <Pressable
      onPress={() => project.href && Linking.openURL(project.href)}
      disabled={!tappable}
      style={{
        width: "100%",
        padding: 22,
        borderRadius: 20,
        backgroundColor: T.ink,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <GCStatus color={T.red} label="LIVE · FLAGSHIP" dark />
        <PlatformIcons platforms={project.platforms} onDark />
      </View>

      <GCEye tone="onDark">{project.domain.toUpperCase()}</GCEye>
      <Text
        style={{
          marginTop: 6,
          fontFamily: "DMSans_500Medium",
          fontSize: 32,
          letterSpacing: -1,
          lineHeight: 34,
          color: T.paper,
        }}
      >
        {project.name}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: "DMSans_400Regular",
          fontSize: 13.5,
          lineHeight: 20,
          color: T.onDarkMid,
        }}
      >
        {project.tagline}
      </Text>

      {project.highlights && project.highlights.length > 0 ? (
        <View style={{ marginTop: 18, gap: 9 }}>
          {project.highlights.map((hl, i) => (
            <View key={hl} style={{ flexDirection: "row", gap: 10 }}>
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 10,
                  color: T.red,
                  letterSpacing: 0.6,
                  minWidth: 22,
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
                  lineHeight: 19,
                  color: T.onDark,
                }}
              >
                {hl}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Stack */}
      <View
        style={{
          marginTop: 18,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {project.stack.map((s) => (
          <GCChip key={s} variant="onDark" size="xs">
            {s}
          </GCChip>
        ))}
      </View>

      {tappable ? (
        <>
          <View style={{ marginTop: 18 }}>
            <GCDash color="rgba(246,244,237,0.22)" />
          </View>
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <GCEye tone="onDark">VIEW ON {project.linkLabel?.toUpperCase()}</GCEye>
            <Text
              style={{
                fontFamily: "JetBrainsMono_500Medium",
                fontSize: 14,
                color: T.red,
              }}
            >
              ↗
            </Text>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

// Paper card for the rest of the fleet.
function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const tappable = !!project.href;
  const isLive = project.status === "live";
  return (
    <Pressable
      onPress={() => project.href && Linking.openURL(project.href)}
      disabled={!tappable}
      style={{
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: T.inkHair,
      }}
    >
      {/* Top row: number · status · platforms */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text
            style={{
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 10,
              color: T.red,
              letterSpacing: 0.6,
            }}
          >
            · {String(index).padStart(2, "0")}
          </Text>
          {isLive ? (
            <GCChip variant="red" size="xs" dot="#fff">
              LIVE
            </GCChip>
          ) : (
            <GCChip variant="ghost" size="xs">
              SHIPPED
            </GCChip>
          )}
        </View>
        <PlatformIcons platforms={project.platforms} />
      </View>

      <GCEye>{project.domain.toUpperCase()}</GCEye>
      <Text
        style={{
          marginTop: 5,
          fontFamily: "DMSans_500Medium",
          fontSize: 23,
          letterSpacing: -0.6,
          color: T.ink,
        }}
      >
        {project.name}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: "DMSans_400Regular",
          fontSize: 13,
          lineHeight: 19,
          color: T.inkSoft,
        }}
      >
        {project.tagline}
      </Text>

      {/* Stack */}
      <View
        style={{
          marginTop: 14,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {project.stack.map((s) => (
          <GCChip key={s} variant="ghost" size="xs">
            {s}
          </GCChip>
        ))}
      </View>

      {/* Link footer */}
      {tappable ? (
        <View style={{ marginTop: 14 }}>
          <GCHair />
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono_500Medium",
                fontSize: 10,
                color: T.inkMid,
                letterSpacing: 0.8,
              }}
            >
              {project.period.toUpperCase()}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <GCEye tone="red">OPEN {project.linkLabel?.toUpperCase()}</GCEye>
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 13,
                  color: T.red,
                }}
              >
                ↗
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();

  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const total = projects.length;
  const onStore = projects.filter((p) => p.linkLabel === "App Store").length;

  return (
    <ScrollView
      testID="screen-projects"
      style={{ flex: 1, backgroundColor: T.paper }}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 4 }} />

      <GCScreenHeader
        eyebrow="§ DEPLOYED FLEET"
        title="Fleet."
        sub="Apps shipped to the App Store, Google Play, and the web. Tap any to open it live."
        meta={`${String(total).padStart(2, "0")} SHIPS`}
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
          { label: "SHIPS", value: String(total).padStart(2, "0") },
          { label: "ON STORE", value: String(onStore).padStart(2, "0") },
          { label: "SINCE", value: "2019" },
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

      {/* Flagship */}
      {featured ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View className="mb-3 flex-row items-center justify-between">
            <GCEye tone="red">§ 01 · FLAGSHIP</GCEye>
            <GCTick>MOST RECENT</GCTick>
          </View>
          <FlagshipCard project={featured} />
        </View>
      ) : null}

      {/* The rest of the fleet */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <View className="mb-3.5 flex-row items-center justify-between">
          <GCEye tone="red">§ 02 · ALSO SHIPPED</GCEye>
          <GCTick>{String(rest.length).padStart(2, "0")} BUILDS</GCTick>
        </View>
        <View style={{ gap: 12 }}>
          {rest.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i + 2} />
          ))}
        </View>
      </View>

      {/* Closing note → Mission Log */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <Link href="/experience" asChild>
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: T.inkHair,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <GCEye>+ INTERNAL & CLIENT BUILDS</GCEye>
              <Text
                style={{
                  marginTop: 3,
                  fontFamily: "DMSans_400Regular",
                  fontSize: 13,
                  lineHeight: 19,
                  color: T.inkMid,
                }}
              >
                NDA and back-office work lives in the full career log.
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
      </View>

      {/* Footer */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <GCDash />
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <GCTick>GC · FLEET MODULE</GCTick>
          <GCTick>STATUS · ALL SYSTEMS GO</GCTick>
        </View>
      </View>
    </ScrollView>
  );
}
