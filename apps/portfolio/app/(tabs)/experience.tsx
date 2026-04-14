import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { experiences, type Experience } from "@/src/data/experience";

function QuestCard({ exp, index }: { exp: Experience; index: number }) {
  const isCurrent = !!exp.isCurrent;

  return (
    <View
      className={`rounded-3xl p-6 ${
        isCurrent ? "bg-prussian-blue" : "border-2 border-prussian-blue"
      }`}
    >
      {/* Period + status row */}
      <View className="mb-4 flex-row items-center justify-between">
        <View
          className={`flex-row items-center gap-2 rounded-full px-3 py-1.5 ${
            isCurrent ? "bg-imperial-red" : "bg-powder-blue/40"
          }`}
        >
          <FontAwesome
            name="calendar"
            size={10}
            color={isCurrent ? "#F1FAEE" : "#1D3557"}
          />
          <Text
            className={`font-display text-[10px] ${
              isCurrent ? "text-honeydew" : "text-prussian-blue"
            }`}
          >
            {exp.period.toUpperCase()}
          </Text>
        </View>
        <View
          className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
            isCurrent ? "bg-honeydew/15" : "bg-prussian-blue/10"
          }`}
        >
          <View
            className={`h-1.5 w-1.5 rounded-full ${
              isCurrent ? "bg-imperial-red" : "bg-celadon-blue"
            }`}
          />
          <Text
            className={`font-display text-[9px] ${
              isCurrent ? "text-honeydew" : "text-prussian-blue/60"
            }`}
          >
            {isCurrent ? "IN PROGRESS" : "COMPLETED"}
          </Text>
        </View>
      </View>

      {/* Quest number */}
      <Text
        className={`mb-1 font-display text-[10px] ${
          isCurrent ? "text-powder-blue" : "text-imperial-red/80"
        }`}
      >
        QUEST · {String(index + 1).padStart(2, "0")}
      </Text>

      {/* Company */}
      <Text
        className={`font-display text-3xl leading-tight ${
          isCurrent ? "text-honeydew" : "text-prussian-blue"
        }`}
      >
        {exp.company}
      </Text>
      <Text
        className={`mt-1 font-display text-xs ${
          isCurrent ? "text-powder-blue" : "text-imperial-red"
        }`}
      >
        {exp.role.toUpperCase()}
      </Text>

      {/* Meta row: employment type + location */}
      <View className="mt-3 flex-row flex-wrap gap-2">
        <View
          className={`rounded-full px-2.5 py-1 ${
            isCurrent ? "bg-honeydew/10" : "bg-prussian-blue/10"
          }`}
        >
          <Text
            className={`font-display text-[9px] ${
              isCurrent ? "text-powder-blue" : "text-prussian-blue/70"
            }`}
          >
            {exp.employmentType.toUpperCase()}
          </Text>
        </View>
        <View
          className={`rounded-full px-2.5 py-1 ${
            isCurrent ? "bg-honeydew/10" : "bg-prussian-blue/10"
          }`}
        >
          <Text
            className={`font-display text-[9px] ${
              isCurrent ? "text-powder-blue" : "text-prussian-blue/70"
            }`}
          >
            {exp.location.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text
        className={`mt-4 font-sans text-sm leading-6 ${
          isCurrent ? "text-honeydew/85" : "text-prussian-blue/80"
        }`}
      >
        {exp.description}
      </Text>

      {/* Highlights */}
      {exp.highlights.length > 0 && (
        <View className="mt-5">
          <Text
            className={`mb-2 font-display text-[10px] ${
              isCurrent ? "text-powder-blue" : "text-prussian-blue/50"
            }`}
          >
            HIGHLIGHTS
          </Text>
          <View className="gap-2">
            {exp.highlights.map((h) => (
              <View key={h} className="flex-row gap-2">
                <Text
                  className={`font-display text-[12px] ${
                    isCurrent ? "text-imperial-red" : "text-imperial-red"
                  }`}
                >
                  ▸
                </Text>
                <Text
                  className={`flex-1 font-sans text-[13px] leading-5 ${
                    isCurrent ? "text-honeydew/85" : "text-prussian-blue/80"
                  }`}
                >
                  {h}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Projects */}
      {exp.projects.length > 0 && (
        <View className="mt-5">
          <Text
            className={`mb-2 font-display text-[10px] ${
              isCurrent ? "text-powder-blue" : "text-prussian-blue/50"
            }`}
          >
            PROJECTS SHIPPED
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {exp.projects.map((proj) => (
              <View
                key={proj}
                className={`rounded-full px-3 py-1.5 ${
                  isCurrent ? "bg-celadon-blue/50" : "bg-powder-blue/40"
                }`}
              >
                <Text
                  className={`font-display text-[11px] ${
                    isCurrent ? "text-honeydew" : "text-prussian-blue"
                  }`}
                >
                  {proj}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills */}
      {exp.skills.length > 0 && (
        <View className="mt-4">
          <Text
            className={`mb-2 font-display text-[10px] ${
              isCurrent ? "text-powder-blue" : "text-prussian-blue/50"
            }`}
          >
            SKILLS USED
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {exp.skills.map((skill) => (
              <View
                key={skill}
                className={`rounded-full border px-2.5 py-1 ${
                  isCurrent
                    ? "border-honeydew/30"
                    : "border-prussian-blue/30"
                }`}
              >
                <Text
                  className={`font-display text-[10px] ${
                    isCurrent ? "text-honeydew/90" : "text-prussian-blue/80"
                  }`}
                >
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function ExperienceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-honeydew"
      contentContainerClassName="pb-20"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 16 }} className="mb-6 px-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-full bg-prussian-blue px-3 py-1.5">
            <FontAwesome name="briefcase" size={10} color="#F1FAEE" />
            <Text className="font-display text-[10px] text-honeydew">
              CAREER LOG
            </Text>
          </View>
          <Text className="font-display text-[11px] text-prussian-blue/50">
            {String(experiences.length).padStart(2, "0")} QUESTS
          </Text>
        </View>
        <Text className="font-display text-5xl leading-tight text-prussian-blue">
          Experience
        </Text>
        <Text className="mt-2 font-ui text-sm text-prussian-blue/60">
          Roles, projects, and missions shipped from 2016 onward — newest
          first.
        </Text>
      </View>

      <View className="gap-4 px-6">
        {experiences.map((exp, i) => (
          <QuestCard key={`${exp.company}-${exp.period}`} exp={exp} index={i} />
        ))}

        {/* Timeline footer */}
        <View className="mt-2 items-center">
          <View className="rounded-full bg-prussian-blue/10 px-4 py-2">
            <Text className="font-display text-[10px] text-prussian-blue/60">
              · START · JUL 2016
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
