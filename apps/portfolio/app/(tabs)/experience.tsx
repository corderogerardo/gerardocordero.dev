import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { experiences } from "@/src/data/experience";

export default function ExperienceScreen() {
  return (
    <ScrollView
      className="flex-1 bg-honeydew"
      contentContainerClassName="pb-16"
    >
      <StatusBar style="dark" />

      {/* Top status strip */}
      <View className="flex-row items-center justify-between border-b-2 border-prussian-blue px-6 py-3">
        <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
          §02 — tenure
        </Text>
        <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
          {String(experiences.length).padStart(2, "0")} entries
        </Text>
      </View>

      {/* Header */}
      <View className="px-6 pt-12 pb-10">
        <Text className="font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
          ↳ years 2018 → 2026
        </Text>
        <Text className="mt-3 font-major text-5xl leading-[0.88] text-prussian-blue">
          tenure
        </Text>
        <View className="mt-5 border-l-2 border-imperial-red pl-5">
          <Text className="font-oxygen text-sm leading-6 text-prussian-blue/80">
            A chronological record of professional engagements across
            outsourcing, staff augmentation, and product teams.
          </Text>
        </View>
      </View>

      {/* Cards */}
      {experiences.map((exp, i) => {
        const isCurrent = i === 0;
        return (
          <View
            key={exp.company}
            className="border-t-2 border-prussian-blue px-6 py-8"
          >
            <View className="mb-5 flex-row items-baseline justify-between">
              <Text className="font-major text-xs uppercase tracking-[2px] text-imperial-red">
                №{String(i + 1).padStart(2, "0")}
              </Text>
              <View className="flex-row items-center gap-2">
                {isCurrent && (
                  <View className="h-2 w-2 rounded-full bg-imperial-red" />
                )}
                <Text className="font-major text-xs uppercase tracking-[2px] text-prussian-blue">
                  {exp.period}
                </Text>
              </View>
            </View>

            <Text className="font-oxygen text-3xl font-bold uppercase tracking-tight text-prussian-blue">
              {exp.company}
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              <View className="h-1 w-1 rounded-full bg-imperial-red" />
              <Text className="font-major text-[11px] uppercase tracking-[2px] text-celadon-blue">
                {exp.role}
              </Text>
            </View>

            <View className="mt-5 border-l-2 border-imperial-red pl-5">
              <Text className="font-oxygen text-base leading-7 text-prussian-blue">
                {exp.description}
              </Text>
            </View>

            <View className="mt-6">
              <Text className="font-major text-[9px] uppercase tracking-[2px] text-celadon-blue">
                ↳ projects
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {exp.projects.split(",").map((proj) => (
                  <View
                    key={proj}
                    className="border border-prussian-blue/40 px-2 py-1"
                  >
                    <Text className="font-oxygen text-[10px] uppercase tracking-wider text-prussian-blue">
                      {proj.trim()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      })}

      {/* Footer */}
      <View className="border-t-2 border-prussian-blue px-6 py-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            end · tenure ledger
          </Text>
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            §02
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
