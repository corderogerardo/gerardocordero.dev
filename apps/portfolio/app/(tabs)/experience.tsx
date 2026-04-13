import { View, Text, ScrollView } from "react-native";
import { experiences } from "@/src/data/experience";

function ExperienceCard({
  period,
  company,
  role,
  description,
  projects,
}: {
  period: string;
  company: string;
  role: string;
  description: string;
  projects: string;
}) {
  return (
    <View className="mb-4 rounded-xl bg-honeydew p-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-celadon-blue">{period}</Text>
      </View>
      <Text className="text-xl font-bold text-prussian-blue">{company}</Text>
      <Text className="mt-1 text-sm font-medium text-imperial-red">{role}</Text>
      <Text className="mt-3 text-sm leading-5 text-prussian-blue/80">
        {description}
      </Text>
      <View className="mt-3 border-t border-powder-blue/30 pt-3">
        <Text className="text-xs font-medium uppercase tracking-wider text-celadon-blue">
          Projects
        </Text>
        <Text className="mt-1 text-sm text-prussian-blue/70">{projects}</Text>
      </View>
    </View>
  );
}

export default function ExperienceScreen() {
  return (
    <ScrollView className="flex-1 bg-prussian-blue">
      <View className="px-5 pb-8 pt-6">
        <Text className="mb-6 text-3xl font-bold text-honeydew">
          Experience
        </Text>
        {experiences.map((exp) => (
          <ExperienceCard key={exp.company} {...exp} />
        ))}
      </View>
    </ScrollView>
  );
}
