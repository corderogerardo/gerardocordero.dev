import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { socialLinks } from "@/src/data/contact";
import { experiences } from "@/src/data/experience";
import { education } from "@/src/data/education";

const STACK = [
  "React",
  "React Native",
  "TypeScript",
  "Node.js",
  "Expo",
  "JavaScript",
];

const INTERESTS = ["AI", "Video Games", "Data", "Languages"];

const YEARS = [
  { label: "JS", value: "10Y" },
  { label: "REACT / RN", value: "8Y" },
  { label: "EXPRESS", value: "3Y" },
  { label: "ANGULAR", value: "2Y" },
];

const QUICK_LINKS = [
  {
    label: "Career Log",
    sub: `${String(experiences.length).padStart(2, "0")} quests completed`,
    path: "/experience",
    icon: "briefcase" as const,
  },
  {
    label: "Studies",
    sub: `${String(education.length).padStart(2, "0")} entries unlocked`,
    path: "/education",
    icon: "book" as const,
  },
  {
    label: "Connect",
    sub: "Send a message",
    path: "/contact",
    icon: "paper-plane" as const,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-honeydew"
      contentContainerClassName="pb-20"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 16 }} className="mb-4 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-full bg-imperial-red/15 px-3 py-1.5">
            <View className="h-2 w-2 rounded-full bg-imperial-red" />
            <Text className="font-display text-[11px] text-imperial-red">
              AVAILABLE
            </Text>
          </View>
          <Text className="font-display text-[11px] text-prussian-blue/50">
            2026 · v1.0
          </Text>
        </View>
      </View>

      {/* Player Card */}
      <View className="mx-6 mb-5 rounded-3xl bg-prussian-blue p-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5 rounded-full bg-imperial-red px-3 py-1.5">
            <FontAwesome name="bolt" size={10} color="#F1FAEE" />
            <Text className="font-display text-[10px] text-honeydew">
              LEVEL 10
            </Text>
          </View>
          <Text className="font-display text-[10px] text-powder-blue">
            @ VALT NETWORK INC.
          </Text>
        </View>

        <View className="mb-7 flex-row items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-imperial-red">
            <Text className="font-display text-3xl text-honeydew">GC</Text>
          </View>
          <View className="flex-1">
            <Text className="font-display text-3xl leading-tight text-honeydew">
              Gerardo
            </Text>
            <Text className="font-display text-3xl leading-tight text-honeydew">
              Cordero
            </Text>
            <Text className="mt-1 font-ui text-xs text-powder-blue">
              Sr. Mobile Engineer
            </Text>
          </View>
        </View>

        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-display text-[10px] text-powder-blue">
              EXPERIENCE
            </Text>
            <Text className="font-display text-[11px] text-honeydew">
              10+ YEARS
            </Text>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full bg-celadon-blue/30">
            <View className="h-full w-[95%] rounded-full bg-imperial-red" />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="mx-6 mb-6 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-imperial-red p-5">
          <Text className="font-display text-4xl text-honeydew">10</Text>
          <Text className="mt-1 font-display text-[10px] text-honeydew/80">
            COMPANIES
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-celadon-blue p-5">
          <Text className="font-display text-4xl text-honeydew">10+</Text>
          <Text className="mt-1 font-display text-[10px] text-honeydew/80">
            YEARS
          </Text>
        </View>
        <View className="flex-1 rounded-2xl border-2 border-prussian-blue p-5">
          <Text className="font-display text-4xl text-prussian-blue">06</Text>
          <Text className="mt-1 font-display text-[10px] text-prussian-blue/60">
            STACK
          </Text>
        </View>
      </View>

      {/* About / Bio */}
      <View className="mx-6 mb-6 rounded-2xl border-2 border-prussian-blue p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-display text-xs text-prussian-blue/60">
            ABOUT
          </Text>
          <View className="rounded-full bg-imperial-red/15 px-2.5 py-1">
            <Text className="font-display text-[9px] text-imperial-red">
              REMOTE · GLOBAL
            </Text>
          </View>
        </View>
        <Text className="font-sans text-sm leading-6 text-prussian-blue/85">
          Full-stack developer focused on mobile. 10+ years remote across
          education, financial education, private markets, home services,
          telecom, and staff augmentation. Deeply invested in developer
          experience — reviews, tests, and shipping quality.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-1.5">
          {YEARS.map((y) => (
            <View
              key={y.label}
              className="flex-row items-center gap-1.5 rounded-full bg-prussian-blue/10 px-2.5 py-1"
            >
              <Text className="font-display text-[10px] text-imperial-red">
                {y.value}
              </Text>
              <Text className="font-display text-[9px] text-prussian-blue/70">
                {y.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stack */}
      <View className="mb-6 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          LOADOUT · STACK
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {STACK.map((tech) => (
            <View
              key={tech}
              className="rounded-full border-2 border-prussian-blue px-4 py-2"
            >
              <Text className="font-display text-xs text-prussian-blue">
                {tech}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Home base */}
      <View className="mx-6 mb-6 rounded-2xl bg-powder-blue/40 p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-display text-xs text-prussian-blue/60">
            HOME BASE
          </Text>
          <View className="flex-row items-center gap-1.5 rounded-full bg-imperial-red/15 px-2.5 py-1">
            <View className="h-1.5 w-1.5 rounded-full bg-imperial-red" />
            <Text className="font-display text-[9px] text-imperial-red">
              ACTIVE
            </Text>
          </View>
        </View>
        <Text className="font-display text-2xl text-prussian-blue">
          Barquisimeto
        </Text>
        <Text className="font-ui text-sm text-prussian-blue/70">
          Venezuela · 10.0678° N
        </Text>
        <View className="mt-4 border-t border-prussian-blue/15 pt-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-[10px] text-prussian-blue/50">
              PREVIOUSLY
            </Text>
            <Text className="font-display text-[11px] text-prussian-blue">
              LIMA, PE
            </Text>
          </View>
          <View className="mt-1.5 flex-row items-center justify-between">
            <Text className="font-display text-[10px] text-prussian-blue/50">
              RETURNED
            </Text>
            <Text className="font-display text-[11px] text-prussian-blue">
              OCT 2022
            </Text>
          </View>
        </View>
      </View>

      {/* Interests */}
      <View className="mb-6 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          PASSIONS
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <View
              key={item}
              className="flex-row items-center gap-2 rounded-full bg-prussian-blue px-4 py-2"
            >
              <View className="h-1.5 w-1.5 rounded-full bg-imperial-red" />
              <Text className="font-display text-xs text-honeydew">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick links */}
      <View className="mb-6 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          CONTINUE
        </Text>
        <View className="gap-3">
          {QUICK_LINKS.map((item) => (
            <Link key={item.label} href={item.path as any} asChild>
              <Pressable className="flex-row items-center justify-between rounded-2xl border-2 border-prussian-blue p-4">
                <View className="flex-row items-center gap-4">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-prussian-blue">
                    <FontAwesome
                      name={item.icon}
                      size={15}
                      color="#F1FAEE"
                    />
                  </View>
                  <View>
                    <Text className="font-display text-base text-prussian-blue">
                      {item.label}
                    </Text>
                    <Text className="mt-0.5 font-ui text-[11px] text-prussian-blue/60">
                      {item.sub}
                    </Text>
                  </View>
                </View>
                <FontAwesome name="arrow-right" size={14} color="#E63946" />
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      {/* Channels */}
      <View className="mb-4 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          CHANNELS
        </Text>
        <View className="flex-row gap-3">
          {socialLinks.map((link) => (
            <Pressable
              key={link.platform}
              onPress={() => Linking.openURL(link.url)}
              className="flex-1 items-center justify-center rounded-2xl bg-prussian-blue p-4"
            >
              <FontAwesome
                name={link.icon as any}
                size={20}
                color="#F1FAEE"
              />
              <Text className="mt-2 font-display text-[10px] text-honeydew">
                {link.platform.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
