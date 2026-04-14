import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { education } from "@/src/data/education";

export default function EducationScreen() {
  return (
    <ScrollView
      className="flex-1 bg-honeydew"
      contentContainerClassName="pb-16"
    >
      <StatusBar style="dark" />

      {/* Top status strip */}
      <View className="flex-row items-center justify-between border-b-2 border-prussian-blue px-6 py-3">
        <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
          §03 — studies
        </Text>
        <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
          {String(education.length).padStart(2, "0")} entries
        </Text>
      </View>

      {/* Header */}
      <View className="px-6 pt-12 pb-10">
        <Text className="font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
          ↳ formal training
        </Text>
        <Text className="mt-3 font-major text-5xl leading-[0.88] text-prussian-blue">
          studies
        </Text>
        <View className="mt-5 border-l-2 border-imperial-red pl-5">
          <Text className="font-oxygen text-sm leading-6 text-prussian-blue/80">
            Structured groundwork in software fundamentals, complemented by
            continuous self-directed learning.
          </Text>
        </View>
      </View>

      {/* Cards */}
      {education.map((edu, i) => (
        <View
          key={edu.institution}
          className="border-t-2 border-prussian-blue px-6 py-8"
        >
          <View className="mb-6 flex-row items-baseline justify-between">
            <Text className="font-major text-xs uppercase tracking-[2px] text-imperial-red">
              №{String(i + 1).padStart(2, "0")}
            </Text>
            <Text className="font-major text-xs uppercase tracking-[2px] text-prussian-blue">
              {edu.period}
            </Text>
          </View>

          <Text className="font-oxygen text-3xl font-bold uppercase tracking-tight text-prussian-blue">
            {edu.institution}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View className="h-1 w-1 rounded-full bg-imperial-red" />
            <Text className="font-major text-[11px] uppercase tracking-[2px] text-celadon-blue">
              {edu.location}
            </Text>
          </View>

          <View className="mt-5 border-l-2 border-imperial-red pl-5">
            <Text className="font-major text-[9px] uppercase tracking-[2px] text-celadon-blue">
              ↳ degree
            </Text>
            <Text className="mt-2 font-oxygen text-base font-medium leading-7 text-prussian-blue">
              {edu.degree}
            </Text>
          </View>

          <View className="mt-6">
            <Text className="font-major text-[9px] uppercase tracking-[2px] text-celadon-blue">
              ↳ coursework
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {edu.topics.split(",").map((topic, j) => (
                <View
                  key={topic}
                  className="flex-row items-center gap-2 border border-prussian-blue/40 px-2 py-1"
                >
                  <Text className="font-major text-[9px] text-imperial-red">
                    {String(j + 1).padStart(2, "0")}
                  </Text>
                  <Text className="font-oxygen text-[10px] uppercase tracking-wider text-prussian-blue">
                    {topic.trim()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}

      {/* Footer */}
      <View className="border-t-2 border-prussian-blue px-6 py-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            end · studies ledger
          </Text>
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            §03
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
