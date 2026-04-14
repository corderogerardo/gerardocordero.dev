import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { education, type Education } from "@/src/data/education";

function FormalCard({ edu }: { edu: Education }) {
  const isCompleted = edu.status === "completed";
  const isLeft = edu.status === "left";
  const topics = edu.topics.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <View
      className={`overflow-hidden rounded-3xl p-6 ${
        isCompleted
          ? "bg-imperial-red"
          : "border-2 border-dashed border-prussian-blue/50"
      }`}
    >
      <View className="mb-5 flex-row items-start justify-between">
        <View
          className={`h-14 w-14 items-center justify-center rounded-2xl ${
            isCompleted ? "bg-honeydew" : "bg-prussian-blue"
          }`}
        >
          <FontAwesome
            name="graduation-cap"
            size={22}
            color={isCompleted ? "#E63946" : "#F1FAEE"}
          />
        </View>
        <View className="items-end gap-1">
          <View
            className={`rounded-full px-3 py-1 ${
              isCompleted ? "bg-honeydew/20" : "bg-prussian-blue/10"
            }`}
          >
            <Text
              className={`font-display text-[10px] ${
                isCompleted ? "text-honeydew" : "text-prussian-blue/70"
              }`}
            >
              {edu.period}
            </Text>
          </View>
          <View
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${
              isCompleted ? "bg-honeydew/10" : "bg-prussian-blue/10"
            }`}
          >
            <FontAwesome
              name={isCompleted ? "check" : isLeft ? "sign-out" : "clock-o"}
              size={8}
              color={isCompleted ? "#F1FAEE" : "#1D3557"}
            />
            <Text
              className={`font-display text-[9px] ${
                isCompleted ? "text-honeydew" : "text-prussian-blue/60"
              }`}
            >
              {isCompleted ? "COMPLETED" : isLeft ? "LEFT" : "IN PROGRESS"}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text
        className={`font-display text-2xl leading-tight ${
          isCompleted ? "text-honeydew" : "text-prussian-blue"
        }`}
      >
        {edu.institution}
      </Text>
      {edu.location && (
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <FontAwesome
            name="map-marker"
            size={10}
            color={isCompleted ? "#F1FAEE" : "#1D3557"}
          />
          <Text
            className={`font-ui text-xs ${
              isCompleted ? "text-honeydew/80" : "text-prussian-blue/70"
            }`}
          >
            {edu.location}
          </Text>
        </View>
      )}

      {/* Degree card */}
      <View
        className={`mt-5 rounded-2xl p-4 ${
          isCompleted ? "bg-honeydew/15" : "bg-prussian-blue/10"
        }`}
      >
        <Text
          className={`font-display text-[10px] ${
            isCompleted ? "text-honeydew/70" : "text-prussian-blue/60"
          }`}
        >
          DEGREE
        </Text>
        <Text
          className={`mt-1.5 font-display text-base leading-5 ${
            isCompleted ? "text-honeydew" : "text-prussian-blue"
          }`}
        >
          {edu.degree}
        </Text>
        {edu.field && (
          <Text
            className={`mt-1 font-ui text-xs ${
              isCompleted ? "text-honeydew/70" : "text-prussian-blue/60"
            }`}
          >
            {edu.field}
          </Text>
        )}
      </View>

      {/* Coursework chips — only if there are real topics */}
      {topics.length > 0 && isCompleted && (
        <View className="mt-5">
          <Text className="mb-2.5 font-display text-[10px] text-honeydew/70">
            SKILLS TRAINED
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {topics.map((topic) => (
              <View
                key={topic}
                className="rounded-full bg-honeydew px-3 py-1.5"
              >
                <Text className="font-display text-[11px] text-imperial-red">
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function CourseRow({ edu, index }: { edu: Education; index: number }) {
  const topics = edu.topics.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <View className="rounded-2xl border-2 border-prussian-blue p-5">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-celadon-blue">
            <FontAwesome name="book" size={14} color="#F1FAEE" />
          </View>
          <View className="flex-1">
            <Text className="font-display text-[10px] text-prussian-blue/50">
              COURSE · {String(index + 1).padStart(2, "0")}
            </Text>
            <Text className="mt-0.5 font-display text-sm text-prussian-blue">
              {edu.institution}
            </Text>
          </View>
        </View>
        <View className="rounded-full bg-imperial-red/15 px-2.5 py-1">
          <Text className="font-display text-[9px] text-imperial-red">
            {edu.period.toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="border-t border-prussian-blue/10 pt-3">
        <Text className="font-display text-base leading-5 text-prussian-blue">
          {edu.degree}
        </Text>
        {topics.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-1.5">
            {topics.map((topic) => (
              <View
                key={topic}
                className="rounded-full bg-prussian-blue/10 px-2.5 py-1"
              >
                <Text className="font-display text-[10px] text-prussian-blue/70">
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function EducationScreen() {
  const insets = useSafeAreaInsets();
  const degrees = education.filter((e) => e.kind === "formal");
  const courses = education.filter((e) => e.kind === "course");

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
            <FontAwesome name="trophy" size={10} color="#F1FAEE" />
            <Text className="font-display text-[10px] text-honeydew">
              ACHIEVEMENTS
            </Text>
          </View>
          <Text className="font-display text-[11px] text-prussian-blue/50">
            {String(degrees.length).padStart(2, "0")} DEGREES ·{" "}
            {String(courses.length).padStart(2, "0")} COURSES
          </Text>
        </View>
        <Text className="font-display text-5xl leading-tight text-prussian-blue">
          Studies
        </Text>
        <Text className="mt-2 font-ui text-sm text-prussian-blue/60">
          Formal training, foundational skills, and continuous learning.
        </Text>
      </View>

      {/* Degrees section */}
      <View className="mb-6 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          FORMAL · DEGREES
        </Text>
        <View className="gap-4">
          {degrees.map((edu) => (
            <FormalCard key={`${edu.institution}-${edu.period}`} edu={edu} />
          ))}
        </View>
      </View>

      {/* Courses section */}
      <View className="mb-6 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          CONTINUOUS · COURSES
        </Text>
        <View className="gap-3">
          {courses.map((edu, i) => (
            <CourseRow
              key={`${edu.institution}-${edu.degree}-${edu.period}`}
              edu={edu}
              index={i}
            />
          ))}
        </View>
      </View>

      {/* Always Learning card */}
      <View className="mx-6 mb-4">
        <View className="rounded-3xl border-2 border-dashed border-prussian-blue/50 p-6">
          <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-prussian-blue">
            <FontAwesome name="rocket" size={18} color="#F1FAEE" />
          </View>
          <Text className="font-display text-2xl leading-tight text-prussian-blue">
            Always Shipping
          </Text>
          <Text className="mt-2 font-sans text-sm leading-6 text-prussian-blue/70">
            Continuous learning via real projects, open source, and the daily
            practice of shipping mobile software.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {[
              "English C1",
              "Self-Directed",
              "Open Source",
              "React Best Practices",
              "Hermes",
            ].map((item) => (
              <View
                key={item}
                className="rounded-full border border-prussian-blue/40 px-3 py-1"
              >
                <Text className="font-display text-[10px] text-prussian-blue/70">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
