import { View, Text, ScrollView } from "react-native";
import { education } from "@/src/data/education";

export default function EducationScreen() {
  return (
    <ScrollView className="flex-1 bg-prussian-blue">
      <View className="px-5 pb-8 pt-6">
        <Text className="mb-6 text-3xl font-bold text-honeydew">
          Education
        </Text>
        {education.map((edu) => (
          <View
            key={edu.institution}
            className="mb-4 rounded-xl bg-honeydew p-5"
          >
            <Text className="text-sm font-medium text-celadon-blue">
              {edu.period}
            </Text>
            <Text className="mt-2 text-xl font-bold text-prussian-blue">
              {edu.institution}
            </Text>
            <Text className="mt-1 text-sm text-prussian-blue/60">
              {edu.location}
            </Text>
            <Text className="mt-3 text-base font-medium text-imperial-red">
              {edu.degree}
            </Text>
            <View className="mt-3 border-t border-powder-blue/30 pt-3">
              <Text className="text-xs font-medium uppercase tracking-wider text-celadon-blue">
                Topics
              </Text>
              <Text className="mt-1 text-sm text-prussian-blue/70">
                {edu.topics}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
