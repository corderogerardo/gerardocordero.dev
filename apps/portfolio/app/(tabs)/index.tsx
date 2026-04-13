import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-prussian-blue">
      <StatusBar style="light" />
      <View className="items-center justify-center px-6 pb-12 pt-20">
        <Text className="text-5xl font-bold tracking-wider text-honeydew">
          Gerardo
        </Text>
        <Text className="text-5xl font-bold tracking-wider text-imperial-red">
          Cordero
        </Text>

        <View className="mt-4 rounded-full bg-celadon-blue/20 px-6 py-2">
          <Text className="text-lg font-medium tracking-widest text-powder-blue">
            JavaScript Developer
          </Text>
        </View>

        <View className="mt-8 w-full max-w-md">
          <Text className="text-center text-base leading-7 text-honeydew/90">
            I'm an individual contributor focused on JavaScript, React, React
            Native. As part of Outsourcing and Staff augmentation companies,
            I've participated in several projects in the business of Education,
            Finance, Travel, and telecommunications.
          </Text>
        </View>

        <View className="mt-10 flex-row flex-wrap justify-center gap-3">
          {["React", "React Native", "TypeScript", "Node.js"].map((tech) => (
            <View
              key={tech}
              className="rounded-lg border border-celadon-blue/30 bg-celadon-blue/10 px-4 py-2"
            >
              <Text className="text-sm font-medium text-powder-blue">
                {tech}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
