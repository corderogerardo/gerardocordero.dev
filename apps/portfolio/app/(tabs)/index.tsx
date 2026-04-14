import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { socialLinks } from "@/src/data/contact";

const STACK = [
  "JavaScript",
  "TypeScript",
  "React",
  "React Native",
  "Expo",
  "Node.js",
];

const INTERESTS = ["AI", "Video Games", "Data", "Languages"];

export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-honeydew"
      contentContainerClassName="pb-16"
    >
      <StatusBar style="dark" />

      {/* Top status strip */}
      <View className="flex-row items-center justify-between border-b-2 border-prussian-blue px-6 py-3">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-imperial-red" />
          <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
            available · lima, pe
          </Text>
        </View>
        <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
          edition 01 / mmxxvi
        </Text>
      </View>

      {/* Hero — masthead */}
      <View className="px-6 pt-12 pb-10">
        <View className="mb-8 flex-row items-baseline gap-3">
          <Text className="font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
            §01
          </Text>
          <View className="h-px flex-1 bg-prussian-blue" />
          <Text className="font-major text-[10px] uppercase tracking-[3px] text-prussian-blue">
            identity
          </Text>
        </View>

        <Text className="font-major text-[56px] leading-[0.88] text-prussian-blue">
          gerardo
        </Text>
        <View className="flex-row items-end">
          <Text className="font-major text-[56px] leading-[0.88] text-prussian-blue">
            cordero
          </Text>
          <Text className="font-major text-[56px] leading-[0.88] text-imperial-red">
            .
          </Text>
        </View>

        <View className="mt-8 flex-row items-baseline gap-3">
          <Text className="font-major text-[10px] uppercase tracking-[3px] text-celadon-blue">
            ↳ title
          </Text>
          <View className="h-px flex-1 bg-prussian-blue/30" />
        </View>
        <Text className="mt-3 font-oxygen text-2xl font-bold text-prussian-blue">
          JavaScript Developer
        </Text>
        <Text className="mt-1 font-major text-[11px] uppercase tracking-[2px] text-imperial-red">
          react · react native specialist
        </Text>
      </View>

      {/* Bio */}
      <View className="border-t border-prussian-blue/20 px-6 py-8">
        <Text className="font-major text-[10px] uppercase tracking-[3px] text-celadon-blue">
          ↳ summary
        </Text>
        <View className="mt-4 border-l-2 border-imperial-red pl-5">
          <Text className="font-oxygen text-base leading-7 text-prussian-blue">
            An individual contributor focused on JavaScript, React, and React
            Native. Through outsourcing and staff augmentation, has shipped
            projects across education, finance, travel, and telecommunications.
          </Text>
        </View>
      </View>

      {/* Atlas — coordinates strip */}
      <View className="bg-prussian-blue px-6 py-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-major text-[9px] uppercase tracking-[2px] text-powder-blue/70">
              origin
            </Text>
            <Text className="mt-1 font-major text-base uppercase tracking-[1px] text-honeydew">
              caracas, ve
            </Text>
            <Text className="font-major text-[9px] uppercase tracking-[2px] text-powder-blue/60">
              10.4806° n
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-major text-2xl text-imperial-red">→</Text>
          </View>
          <View className="items-end">
            <Text className="font-major text-[9px] uppercase tracking-[2px] text-powder-blue/70">
              based
            </Text>
            <Text className="mt-1 font-major text-base uppercase tracking-[1px] text-honeydew">
              lima, pe
            </Text>
            <Text className="font-major text-[9px] uppercase tracking-[2px] text-powder-blue/60">
              12.0464° s
            </Text>
          </View>
        </View>
      </View>

      {/* Stack — specimen grid */}
      <View className="px-6 py-10">
        <View className="mb-5 flex-row items-baseline gap-3">
          <Text className="font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
            ↳
          </Text>
          <Text className="font-major text-[10px] uppercase tracking-[3px] text-prussian-blue">
            stack · specimen
          </Text>
          <View className="h-px flex-1 bg-prussian-blue/30" />
          <Text className="font-major text-[10px] uppercase tracking-[2px] text-celadon-blue">
            06 items
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {STACK.map((tech, i) => (
            <View
              key={tech}
              className="flex-row items-center gap-2 border border-prussian-blue px-3 py-2"
            >
              <Text className="font-major text-[9px] text-imperial-red">
                {String(i + 1).padStart(2, "0")}
              </Text>
              <Text className="font-oxygen text-xs font-medium uppercase tracking-wider text-prussian-blue">
                {tech}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Interests */}
      <View className="border-t border-prussian-blue/20 px-6 py-10">
        <View className="mb-5 flex-row items-baseline gap-3">
          <Text className="font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
            ↳
          </Text>
          <Text className="font-major text-[10px] uppercase tracking-[3px] text-prussian-blue">
            preoccupations
          </Text>
          <View className="h-px flex-1 bg-prussian-blue/30" />
        </View>
        <View className="flex-row flex-wrap gap-x-6 gap-y-2">
          {INTERESTS.map((item) => (
            <View key={item} className="flex-row items-center gap-2">
              <Text className="font-major text-base text-imperial-red">●</Text>
              <Text className="font-oxygen text-sm font-medium uppercase tracking-wider text-prussian-blue">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Index — section links */}
      <View className="border-t-2 border-prussian-blue px-6 py-8">
        <Text className="mb-2 font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
          ↳ contents
        </Text>
        <Text className="mb-6 font-major text-3xl text-prussian-blue">
          index
        </Text>

        {[
          { num: "02", label: "Tenure", sub: "work history", path: "/experience" },
          { num: "03", label: "Studies", sub: "formal training", path: "/education" },
          { num: "04", label: "Dispatch", sub: "channels", path: "/contact" },
        ].map((item) => (
          <Link key={item.num} href={item.path as any} asChild>
            <Pressable className="flex-row items-center justify-between border-t border-prussian-blue/30 py-5">
              <View className="flex-row items-baseline gap-5">
                <Text className="font-major text-xs text-imperial-red">
                  §{item.num}
                </Text>
                <View>
                  <Text className="font-oxygen text-2xl font-bold uppercase tracking-tight text-prussian-blue">
                    {item.label}
                  </Text>
                  <Text className="mt-1 font-major text-[9px] uppercase tracking-[2px] text-celadon-blue">
                    {item.sub}
                  </Text>
                </View>
              </View>
              <Text className="font-major text-2xl text-prussian-blue">→</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      {/* Channels */}
      <View className="border-t border-prussian-blue/20 px-6 py-8">
        <Text className="mb-4 font-major text-[10px] uppercase tracking-[3px] text-celadon-blue">
          ↳ channels
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {socialLinks.map((link) => (
            <Pressable
              key={link.platform}
              onPress={() => Linking.openURL(link.url)}
              className="border border-prussian-blue px-3 py-2"
            >
              <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
                ↗ {link.platform}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Footer / colophon */}
      <View className="border-t-2 border-prussian-blue px-6 py-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            gerardocordero.dev
          </Text>
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            © mmxxvi
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
